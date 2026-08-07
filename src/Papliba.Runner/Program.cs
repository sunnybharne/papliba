using System.Diagnostics;
using System.Text.Json;
using Microsoft.Data.Sqlite;

const string workspaceId = "default";
const int maximumWorkspaceBytes = 2 * 1024 * 1024;
const int maximumPythonScriptBytes = 256 * 1024;
const int localAiTimeoutSeconds = 120;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls(
    builder.Configuration["PAPLIBA_RUNNER_URL"] ?? "http://127.0.0.1:5127"
);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(
                "http://127.0.0.1:3000",
                "http://localhost:3000",
                "https://sunnybharne.github.io"
            )
            .WithMethods("GET", "POST", "PUT")
            .WithHeaders("Content-Type");
    });
});

var dataDirectory = builder.Configuration["PAPLIBA_DATA_DIRECTORY"];

if (string.IsNullOrWhiteSpace(dataDirectory))
{
    dataDirectory = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "Papliba"
    );
}

Directory.CreateDirectory(dataDirectory);

var databasePath = Path.Combine(dataDirectory, "papliba.db");
var projectsDirectory = Path.Combine(dataDirectory, "projects");
var legacyScriptsDirectory = Path.Combine(dataDirectory, "scripts");
var trashDirectory = Path.Combine(dataDirectory, "trash");
Directory.CreateDirectory(projectsDirectory);
Directory.CreateDirectory(trashDirectory);

var connectionString = new SqliteConnectionStringBuilder
{
    DataSource = databasePath,
    Mode = SqliteOpenMode.ReadWriteCreate,
}.ToString();

await InitializeDatabase(connectionString);

var app = builder.Build();

app.UseCors();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    storage = "sqlite",
}));

app.MapGet("/api/workspace", async () =>
{
    await using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = """
        SELECT schema_version, revision, payload, updated_at
        FROM workspace
        WHERE id = $id;
        """;
    command.Parameters.AddWithValue("$id", workspaceId);

    await using var reader = await command.ExecuteReaderAsync();

    if (!await reader.ReadAsync())
    {
        return Results.NotFound();
    }

    var schemaVersion = reader.GetInt32(0);
    var revision = reader.GetInt32(1);
    var payload = reader.GetString(2);
    var updatedAt = reader.GetString(3);

    using var workspaceDocument = JsonDocument.Parse(payload);

    return Results.Ok(new WorkspaceResponse(
        schemaVersion,
        revision,
        workspaceDocument.RootElement.Clone(),
        updatedAt
    ));
});

app.MapPut("/api/workspace", async (WorkspaceSaveRequest request) =>
{
    if (request.SchemaVersion != 1)
    {
        return Results.BadRequest(new ErrorResponse("Unsupported workspace schema version."));
    }

    if (request.ExpectedRevision < 0 || request.Workspace.ValueKind != JsonValueKind.Object)
    {
        return Results.BadRequest(new ErrorResponse("Invalid workspace document."));
    }

    var payload = request.Workspace.GetRawText();

    if (System.Text.Encoding.UTF8.GetByteCount(payload) > maximumWorkspaceBytes)
    {
        return Results.Json(
            new ErrorResponse("Workspace document is too large."),
            statusCode: StatusCodes.Status413PayloadTooLarge
        );
    }

    await using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();
    await using var transaction = await connection.BeginTransactionAsync();

    var currentRevisionCommand = connection.CreateCommand();
    currentRevisionCommand.Transaction = (SqliteTransaction)transaction;
    currentRevisionCommand.CommandText = "SELECT revision FROM workspace WHERE id = $id;";
    currentRevisionCommand.Parameters.AddWithValue("$id", workspaceId);

    var currentRevisionValue = await currentRevisionCommand.ExecuteScalarAsync();
    var currentRevision = currentRevisionValue is null
        ? 0
        : Convert.ToInt32(currentRevisionValue);

    if (currentRevision != request.ExpectedRevision)
    {
        await transaction.RollbackAsync();
        return Results.Conflict(new ConflictResponse(
            "Workspace was changed by another client.",
            currentRevision
        ));
    }

    var nextRevision = currentRevision + 1;
    var updatedAt = DateTimeOffset.UtcNow.ToString("O");
    var saveCommand = connection.CreateCommand();
    saveCommand.Transaction = (SqliteTransaction)transaction;
    saveCommand.CommandText = """
        INSERT INTO workspace (id, schema_version, revision, payload, updated_at)
        VALUES ($id, $schemaVersion, $revision, $payload, $updatedAt)
        ON CONFLICT(id) DO UPDATE SET
            schema_version = excluded.schema_version,
            revision = excluded.revision,
            payload = excluded.payload,
            updated_at = excluded.updated_at;
        """;
    saveCommand.Parameters.AddWithValue("$id", workspaceId);
    saveCommand.Parameters.AddWithValue("$schemaVersion", request.SchemaVersion);
    saveCommand.Parameters.AddWithValue("$revision", nextRevision);
    saveCommand.Parameters.AddWithValue("$payload", payload);
    saveCommand.Parameters.AddWithValue("$updatedAt", updatedAt);

    await saveCommand.ExecuteNonQueryAsync();
    await transaction.CommitAsync();

    return Results.Ok(new WorkspaceResponse(
        request.SchemaVersion,
        nextRevision,
        request.Workspace,
        updatedAt
    ));
});

app.MapPost("/api/python-scripts/open", async (OpenPythonScriptRequest request) =>
{
    var scriptName = GetScriptName(request.NodeId, request.ScriptName);

    if (!IsValidPythonScriptRequest(
        request.ProjectName,
        request.WorkflowName,
        request.NodeId,
        scriptName
    ))
    {
        return Results.BadRequest(new ErrorResponse("Invalid Python script identifier."));
    }

    var workflowDirectory = Path.Combine(projectsDirectory, request.ProjectName, request.WorkflowName);
    var scriptPath = await EnsurePythonScriptFile(
        projectsDirectory,
        legacyScriptsDirectory,
        trashDirectory,
        request.ProjectName,
        request.WorkflowName,
        request.NodeId,
        scriptName
    );

    var openError = await OpenInVisualStudioCode(
        workflowDirectory,
        scriptPath,
        builder.Configuration["PAPLIBA_VSCODE_COMMAND"]
    );

    if (openError is not null)
    {
        return Results.Json(
            new ErrorResponse(openError),
            statusCode: StatusCodes.Status503ServiceUnavailable
        );
    }

    return Results.Ok(new PythonScriptResponse(scriptPath));
});

app.MapPost("/api/python-scripts/trash", (OpenPythonScriptRequest request) =>
{
    var scriptName = GetScriptName(request.NodeId, request.ScriptName);

    if (!IsValidPythonScriptRequest(
        request.ProjectName,
        request.WorkflowName,
        request.NodeId,
        scriptName
    ))
    {
        return Results.BadRequest(new ErrorResponse("Invalid Python script identifier."));
    }

    var scriptPath = Path.Combine(
        projectsDirectory,
        request.ProjectName,
        request.WorkflowName,
        "python-scripts",
        $"{scriptName}.py"
    );
    var nodeIdScriptPath = Path.Combine(
        projectsDirectory,
        request.ProjectName,
        request.WorkflowName,
        "python-scripts",
        $"{request.NodeId}.py"
    );
    var legacyScriptPath = Path.Combine(
        legacyScriptsDirectory,
        request.ProjectName,
        request.WorkflowName,
        $"{request.NodeId}.py"
    );
    var sourcePath = File.Exists(scriptPath)
        ? scriptPath
        : File.Exists(nodeIdScriptPath)
            ? nodeIdScriptPath
        : File.Exists(legacyScriptPath)
            ? legacyScriptPath
            : null;

    if (sourcePath is null)
    {
        return Results.Ok(new PythonScriptTrashResponse(false, null));
    }

    var trashedScriptsDirectory = Path.Combine(
        trashDirectory,
        "projects",
        request.ProjectName,
        request.WorkflowName,
        "python-scripts"
    );
    Directory.CreateDirectory(trashedScriptsDirectory);

    var trashName = $"{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}-{scriptName}.py";
    var trashPath = Path.Combine(trashedScriptsDirectory, trashName);
    File.Move(sourcePath, trashPath);

    return Results.Ok(new PythonScriptTrashResponse(true, trashPath));
});

app.MapPost("/api/python-scripts/chat", async (PythonScriptChatRequest request) =>
{
    var scriptName = GetScriptName(request.NodeId, request.ScriptName);

    if (!IsValidPythonScriptRequest(
        request.ProjectName,
        request.WorkflowName,
        request.NodeId,
        scriptName
    ))
    {
        return Results.BadRequest(new ErrorResponse("Invalid Python script identifier."));
    }

    if (string.IsNullOrWhiteSpace(request.Message))
    {
        return Results.BadRequest(new ErrorResponse("Enter a message for the chat."));
    }

    var workflowDirectory = Path.Combine(projectsDirectory, request.ProjectName, request.WorkflowName);
    var scriptPath = await EnsurePythonScriptFile(
        projectsDirectory,
        legacyScriptsDirectory,
        trashDirectory,
        request.ProjectName,
        request.WorkflowName,
        request.NodeId,
        scriptName
    );
    var currentCode = await File.ReadAllTextAsync(scriptPath);
    var prompt = BuildPythonEditPrompt(scriptName, currentCode, request.Message);
    var aiCommand = builder.Configuration["PAPLIBA_AI_COMMAND"]
        ?? "codex exec --skip-git-repo-check --sandbox read-only -";
    var aiResult = await AskLocalAiCommand(aiCommand, workflowDirectory, prompt);

    if (!aiResult.IsSuccess)
    {
        return Results.Json(
            new ErrorResponse(aiResult.Error),
            statusCode: StatusCodes.Status503ServiceUnavailable
        );
    }

    var code = ExtractPythonCode(aiResult.Output);

    if (string.IsNullOrWhiteSpace(code))
    {
        return Results.Json(
            new ErrorResponse("The local AI command did not return Python code."),
            statusCode: StatusCodes.Status502BadGateway
        );
    }

    return Results.Ok(new PythonScriptChatResponse(code));
});

app.MapPost("/api/python-scripts/apply", async (PythonScriptApplyRequest request) =>
{
    var scriptName = GetScriptName(request.NodeId, request.ScriptName);

    if (!IsValidPythonScriptRequest(
        request.ProjectName,
        request.WorkflowName,
        request.NodeId,
        scriptName
    ))
    {
        return Results.BadRequest(new ErrorResponse("Invalid Python script identifier."));
    }

    if (
        string.IsNullOrWhiteSpace(request.Code)
        || System.Text.Encoding.UTF8.GetByteCount(request.Code) > maximumPythonScriptBytes
    )
    {
        return Results.BadRequest(new ErrorResponse("Invalid Python script content."));
    }

    var scriptPath = await EnsurePythonScriptFile(
        projectsDirectory,
        legacyScriptsDirectory,
        trashDirectory,
        request.ProjectName,
        request.WorkflowName,
        request.NodeId,
        scriptName
    );

    await File.WriteAllTextAsync(scriptPath, request.Code.TrimEnd() + Environment.NewLine);

    return Results.Ok(new PythonScriptResponse(scriptPath));
});

app.Run();

static string GetScriptName(string nodeId, string? scriptName)
{
    return string.IsNullOrWhiteSpace(scriptName) ? nodeId : scriptName;
}

static bool IsValidPythonScriptRequest(
    string projectName,
    string workflowName,
    string nodeId,
    string scriptName
)
{
    return IsSafePathSegment(projectName)
        && IsSafePathSegment(workflowName)
        && IsSafePathSegment(nodeId)
        && IsSafePathSegment(scriptName);
}

static bool IsSafePathSegment(string value)
{
    return !string.IsNullOrWhiteSpace(value)
        && value.Length <= 120
        && value.All(character =>
            char.IsAsciiLetterOrDigit(character) || character is '-' or '_'
        );
}

static async Task<string> EnsurePythonScriptFile(
    string projectsDirectory,
    string legacyScriptsDirectory,
    string trashDirectory,
    string projectName,
    string workflowName,
    string nodeId,
    string scriptName
)
{
    var workflowScriptsDirectory = Path.Combine(
        projectsDirectory,
        projectName,
        workflowName,
        "python-scripts"
    );
    Directory.CreateDirectory(workflowScriptsDirectory);

    var scriptPath = Path.Combine(workflowScriptsDirectory, $"{scriptName}.py");
    var nodeIdScriptPath = Path.Combine(workflowScriptsDirectory, $"{nodeId}.py");
    var legacyScriptPath = Path.Combine(
        legacyScriptsDirectory,
        projectName,
        workflowName,
        $"{nodeId}.py"
    );

    if (
        !File.Exists(scriptPath)
        && !string.Equals(scriptPath, nodeIdScriptPath, StringComparison.Ordinal)
        && File.Exists(nodeIdScriptPath)
    )
    {
        File.Move(nodeIdScriptPath, scriptPath);
    }

    if (!File.Exists(scriptPath) && File.Exists(legacyScriptPath))
    {
        File.Move(legacyScriptPath, scriptPath);
    }

    if (!File.Exists(scriptPath))
    {
        var trashedScriptsDirectory = Path.Combine(
            trashDirectory,
            "projects",
            projectName,
            workflowName,
            "python-scripts"
        );
        var trashedScriptPath = Directory.Exists(trashedScriptsDirectory)
            ? Directory
                .EnumerateFiles(trashedScriptsDirectory, $"*-{scriptName}.py")
                .Concat(Directory.EnumerateFiles(
                    trashedScriptsDirectory,
                    $"*-{nodeId}.py"
                ))
                .OrderDescending()
                .FirstOrDefault()
            : null;

        if (trashedScriptPath is not null)
        {
            File.Move(trashedScriptPath, scriptPath);
        }
    }

    if (!File.Exists(scriptPath))
    {
        await File.WriteAllTextAsync(scriptPath, GetDefaultPythonScript());
    }

    return scriptPath;
}

static string GetDefaultPythonScript()
{
    return """
        # Papliba Python script

        def main(input_data):
            # Transform the workflow input and return the result.
            return input_data
        """;
}

static string BuildPythonEditPrompt(
    string scriptName,
    string currentCode,
    string userMessage
)
{
    return $$"""
        You are editing a local Papliba Python workflow script.

        File name: {{scriptName}}.py

        Rules:
        - Return only the complete Python file content.
        - Do not include markdown fences.
        - Keep a main(input_data) function unless the user clearly asks otherwise.
        - Keep the code simple and readable.

        Current Python file:
        ```python
        {{currentCode}}
        ```

        User request:
        {{userMessage}}
        """;
}

static async Task<LocalAiCommandResult> AskLocalAiCommand(
    string commandLine,
    string workingDirectory,
    string prompt
)
{
    if (string.IsNullOrWhiteSpace(commandLine))
    {
        return new LocalAiCommandResult(
            false,
            "",
            "Set PAPLIBA_AI_COMMAND to your logged-in AI terminal command."
        );
    }

    try
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = OperatingSystem.IsWindows() ? "cmd.exe" : "/bin/zsh",
            WorkingDirectory = workingDirectory,
            UseShellExecute = false,
            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
        };

        if (OperatingSystem.IsWindows())
        {
            startInfo.ArgumentList.Add("/c");
        }
        else
        {
            startInfo.ArgumentList.Add("-lc");
        }

        startInfo.ArgumentList.Add(commandLine);

        using var process = Process.Start(startInfo);

        if (process is null)
        {
            return new LocalAiCommandResult(false, "", "Could not start the local AI command.");
        }

        await process.StandardInput.WriteAsync(prompt);
        process.StandardInput.Close();

        var outputTask = process.StandardOutput.ReadToEndAsync();
        var errorTask = process.StandardError.ReadToEndAsync();

        using var timeout = new CancellationTokenSource(
            TimeSpan.FromSeconds(localAiTimeoutSeconds)
        );

        try
        {
            await process.WaitForExitAsync(timeout.Token);
        }
        catch (OperationCanceledException)
        {
            process.Kill(entireProcessTree: true);
            return new LocalAiCommandResult(false, "", "The local AI command timed out.");
        }

        var output = await outputTask;
        var error = await errorTask;

        if (process.ExitCode != 0)
        {
            return new LocalAiCommandResult(
                false,
                output,
                string.IsNullOrWhiteSpace(error)
                    ? "The local AI command failed."
                    : error.Trim()
            );
        }

        return new LocalAiCommandResult(true, output, "");
    }
    catch (Exception exception)
    {
        return new LocalAiCommandResult(
            false,
            "",
            $"Could not run the local AI command: {exception.Message}"
        );
    }
}

static string ExtractPythonCode(string response)
{
    var trimmed = response.Trim();

    if (!trimmed.StartsWith("```", StringComparison.Ordinal))
    {
        return trimmed;
    }

    var firstLineBreak = trimmed.IndexOf('\n');
    var lastFence = trimmed.LastIndexOf("```", StringComparison.Ordinal);

    if (firstLineBreak < 0 || lastFence <= firstLineBreak)
    {
        return trimmed;
    }

    return trimmed[(firstLineBreak + 1)..lastFence].Trim();
}

static async Task<string?> OpenInVisualStudioCode(
    string workflowDirectory,
    string scriptPath,
    string? configuredCommand
)
{
    try
    {
        var startInfo = new ProcessStartInfo
        {
            UseShellExecute = false,
            RedirectStandardError = true,
        };

        if (!string.IsNullOrWhiteSpace(configuredCommand))
        {
            startInfo.FileName = configuredCommand;
            startInfo.ArgumentList.Add(workflowDirectory);
            startInfo.ArgumentList.Add(scriptPath);
        }
        else if (OperatingSystem.IsMacOS())
        {
            var visualStudioCodeCommand =
                "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code";

            if (File.Exists(visualStudioCodeCommand))
            {
                startInfo.FileName = visualStudioCodeCommand;
                startInfo.ArgumentList.Add("--reuse-window");
                startInfo.ArgumentList.Add(workflowDirectory);
                startInfo.ArgumentList.Add(scriptPath);
            }
            else
            {
                startInfo.FileName = "open";
                startInfo.ArgumentList.Add("-a");
                startInfo.ArgumentList.Add("Visual Studio Code");
                startInfo.ArgumentList.Add(workflowDirectory);
                startInfo.ArgumentList.Add(scriptPath);
            }
        }
        else
        {
            startInfo.FileName = OperatingSystem.IsWindows() ? "code.cmd" : "code";
            startInfo.ArgumentList.Add("--reuse-window");
            startInfo.ArgumentList.Add(workflowDirectory);
            startInfo.ArgumentList.Add(scriptPath);
        }

        using var process = Process.Start(startInfo);

        if (process is null)
        {
            return "Could not start Visual Studio Code.";
        }

        var standardErrorTask = process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();
        var standardError = await standardErrorTask;

        return process.ExitCode == 0
            ? null
            : string.IsNullOrWhiteSpace(standardError)
                ? "Visual Studio Code could not open the Python script."
                : standardError.Trim();
    }
    catch (Exception exception)
    {
        return $"Could not open Visual Studio Code: {exception.Message}";
    }
}

static async Task InitializeDatabase(string connectionString)
{
    await using var connection = new SqliteConnection(connectionString);
    await connection.OpenAsync();

    var command = connection.CreateCommand();
    command.CommandText = """
        PRAGMA journal_mode = WAL;
        PRAGMA busy_timeout = 5000;

        CREATE TABLE IF NOT EXISTS workspace (
            id TEXT PRIMARY KEY,
            schema_version INTEGER NOT NULL,
            revision INTEGER NOT NULL,
            payload TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
        """;

    await command.ExecuteNonQueryAsync();
}

record WorkspaceSaveRequest(
    int SchemaVersion,
    int ExpectedRevision,
    JsonElement Workspace
);

record WorkspaceResponse(
    int SchemaVersion,
    int Revision,
    JsonElement Workspace,
    string UpdatedAt
);

record OpenPythonScriptRequest(
    string ProjectName,
    string WorkflowName,
    string NodeId,
    string? ScriptName
);

record PythonScriptResponse(string Path);

record PythonScriptTrashResponse(bool Trashed, string? Path);

record PythonScriptChatRequest(
    string ProjectName,
    string WorkflowName,
    string NodeId,
    string? ScriptName,
    string Message
);

record PythonScriptChatResponse(string Code);

record PythonScriptApplyRequest(
    string ProjectName,
    string WorkflowName,
    string NodeId,
    string? ScriptName,
    string Code
);

record LocalAiCommandResult(bool IsSuccess, string Output, string Error);

record ErrorResponse(string Error);

record ConflictResponse(string Error, int CurrentRevision);

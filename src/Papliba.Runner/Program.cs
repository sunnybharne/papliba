using System.Diagnostics;
using System.Text.Json;
using Microsoft.Data.Sqlite;

const string workspaceId = "default";
const int maximumWorkspaceBytes = 2 * 1024 * 1024;
const int maximumPythonScriptBytes = 256 * 1024;
const int localAiTimeoutSeconds = 120;
const int codexAuthCheckTimeoutSeconds = 10;

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
var configuredAiCommand = builder.Configuration["PAPLIBA_AI_COMMAND"];
var usesCodexCli = string.IsNullOrWhiteSpace(configuredAiCommand);
var codexCommand = builder.Configuration["PAPLIBA_CODEX_COMMAND"] ?? "codex";
Directory.CreateDirectory(projectsDirectory);
Directory.CreateDirectory(trashDirectory);

var connectionString = new SqliteConnectionStringBuilder
{
    DataSource = databasePath,
    Mode = SqliteOpenMode.ReadWriteCreate,
}.ToString();

await InitializeDatabase(connectionString);

var app = builder.Build();
var codexLoginLock = new object();
var pythonScriptFileLock = new SemaphoreSlim(1, 1);
Process? codexLoginProcess = null;

app.UseCors();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    storage = "sqlite",
}));

app.MapGet("/api/codex/auth/status", async () =>
{
    if (!usesCodexCli)
    {
        return Results.Ok(new CodexAuthResponse(
            true,
            true,
            "custom",
            null
        ));
    }

    return Results.Ok(await GetCodexAuthStatus(
        codexCommand,
        projectsDirectory,
        codexAuthCheckTimeoutSeconds
    ));
});

app.MapPost("/api/codex/auth/login", async () =>
{
    if (!usesCodexCli)
    {
        return Results.BadRequest(new ErrorResponse(
            "Papliba is configured to use a custom AI command."
        ));
    }

    var authStatus = await GetCodexAuthStatus(
        codexCommand,
        projectsDirectory,
        codexAuthCheckTimeoutSeconds
    );

    if (authStatus.Authenticated)
    {
        return Results.Ok(authStatus);
    }

    if (!authStatus.Available)
    {
        return Results.Json(
            new ErrorResponse(authStatus.Error ?? "Codex CLI is not available."),
            statusCode: StatusCodes.Status503ServiceUnavailable
        );
    }

    lock (codexLoginLock)
    {
        if (codexLoginProcess is not null && !codexLoginProcess.HasExited)
        {
            return Results.Accepted(
                "/api/codex/auth/status",
                new CodexLoginResponse(true)
            );
        }

        codexLoginProcess?.Dispose();
        codexLoginProcess = StartCodexLogin(codexCommand, projectsDirectory);

        if (codexLoginProcess is null)
        {
            return Results.Json(
                new ErrorResponse("Could not start Codex sign-in."),
                statusCode: StatusCodes.Status503ServiceUnavailable
            );
        }

        var loginProcess = codexLoginProcess;
        loginProcess.Exited += (_, _) =>
        {
            lock (codexLoginLock)
            {
                if (ReferenceEquals(codexLoginProcess, loginProcess))
                {
                    codexLoginProcess = null;
                }
            }

            loginProcess.Dispose();
        };
        loginProcess.EnableRaisingEvents = true;
    }

    return Results.Accepted(
        "/api/codex/auth/status",
        new CodexLoginResponse(true)
    );
});

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
    var openTarget = string.IsNullOrWhiteSpace(request.Target)
        ? "vscode"
        : request.Target.ToLowerInvariant();

    if (!IsValidPythonScriptRequest(
        request.ProjectName,
        request.WorkflowName,
        request.NodeId,
        scriptName
    ))
    {
        return Results.BadRequest(new ErrorResponse("Invalid Python script identifier."));
    }

    if (openTarget is not (
        "vscode" or "cursor" or "finder" or "terminal" or "ghostty" or "xcode"
    ))
    {
        return Results.BadRequest(new ErrorResponse("Unsupported application target."));
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
    var scriptDirectory = Path.GetDirectoryName(scriptPath)!;

    var openError = await OpenPythonScript(
        scriptDirectory,
        scriptPath,
        openTarget,
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

app.MapPost("/api/python-scripts/content", async (OpenPythonScriptRequest request) =>
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

    var scriptPath = await EnsurePythonScriptFile(
        projectsDirectory,
        legacyScriptsDirectory,
        trashDirectory,
        request.ProjectName,
        request.WorkflowName,
        request.NodeId,
        scriptName
    );

    if (new FileInfo(scriptPath).Length > maximumPythonScriptBytes)
    {
        return Results.Json(
            new ErrorResponse("Python script is too large to preview."),
            statusCode: StatusCodes.Status413PayloadTooLarge
        );
    }

    return Results.Ok(new PythonScriptContentResponse(
        scriptPath,
        await File.ReadAllTextAsync(scriptPath)
    ));
});

app.MapPost("/api/python-scripts/rename", async (RenamePythonScriptRequest request) =>
{
    var currentScriptName = GetScriptName(request.NodeId, request.ScriptName);
    var nextScriptName = request.NextScriptName.Trim();

    if (
        !IsValidPythonScriptRequest(
            request.ProjectName,
            request.WorkflowName,
            request.NodeId,
            currentScriptName
        )
        || !IsSafePathSegment(nextScriptName)
    )
    {
        return Results.BadRequest(new ErrorResponse("Invalid Python script name."));
    }

    var currentPath = await EnsurePythonScriptFile(
        projectsDirectory,
        legacyScriptsDirectory,
        trashDirectory,
        request.ProjectName,
        request.WorkflowName,
        request.NodeId,
        currentScriptName
    );
    var currentDirectory = Path.GetDirectoryName(currentPath)!;
    var nextDirectory = Path.Combine(
        projectsDirectory,
        request.ProjectName,
        request.WorkflowName,
        "python-scripts",
        nextScriptName
    );
    var nextPath = Path.Combine(nextDirectory, "main.py");

    if (string.Equals(currentDirectory, nextDirectory, StringComparison.Ordinal))
    {
        return Results.Ok(new PythonScriptResponse(currentPath));
    }

    if (
        Directory.Exists(nextDirectory)
        || File.Exists($"{nextDirectory}.py")
    )
    {
        return Results.Conflict(
            new ErrorResponse($"A Python step named {nextScriptName} already exists.")
        );
    }

    Directory.Move(currentDirectory, nextDirectory);
    return Results.Ok(new PythonScriptResponse(nextPath));
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

    var workflowScriptsDirectory = Path.Combine(
        projectsDirectory,
        request.ProjectName,
        request.WorkflowName,
        "python-scripts"
    );
    var scriptDirectory = Path.Combine(workflowScriptsDirectory, scriptName);
    var scriptPath = Path.Combine(workflowScriptsDirectory, $"{scriptName}.py");
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

    if (!Directory.Exists(scriptDirectory) && sourcePath is null)
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

    var trashName = $"{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}-{scriptName}";
    var trashPath = Path.Combine(trashedScriptsDirectory, trashName);

    if (Directory.Exists(scriptDirectory))
    {
        Directory.Move(scriptDirectory, trashPath);
    }
    else
    {
        Directory.CreateDirectory(trashPath);
        File.Move(sourcePath!, Path.Combine(trashPath, "main.py"));
    }

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

    if (usesCodexCli)
    {
        var authStatus = await GetCodexAuthStatus(
            codexCommand,
            projectsDirectory,
            codexAuthCheckTimeoutSeconds
        );

        if (!authStatus.Authenticated)
        {
            return Results.Json(
                new ErrorResponse(
                    authStatus.Available
                        ? "Sign in with ChatGPT before using Codex."
                        : authStatus.Error ?? "Codex CLI is not available."
                ),
                statusCode: authStatus.Available
                    ? StatusCodes.Status401Unauthorized
                    : StatusCodes.Status503ServiceUnavailable
            );
        }
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
    var scriptDirectory = Path.GetDirectoryName(scriptPath)!;
    var currentCode = await File.ReadAllTextAsync(scriptPath);
    var prompt = BuildPythonEditPrompt(scriptName, currentCode, request.Message);
    var aiCommand = configuredAiCommand
        ?? "codex exec --skip-git-repo-check --sandbox read-only -";
    var aiResult = await AskLocalAiCommand(aiCommand, scriptDirectory, prompt);

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

async Task<string> EnsurePythonScriptFile(
    string projectsDirectory,
    string legacyScriptsDirectory,
    string trashDirectory,
    string projectName,
    string workflowName,
    string nodeId,
    string scriptName
)
{
    await pythonScriptFileLock.WaitAsync();

    try
    {
    var workflowScriptsDirectory = Path.Combine(
        projectsDirectory,
        projectName,
        workflowName,
        "python-scripts"
    );
    Directory.CreateDirectory(workflowScriptsDirectory);

    var scriptDirectory = Path.Combine(workflowScriptsDirectory, scriptName);
    var scriptPath = Path.Combine(scriptDirectory, "main.py");
    var flatScriptPath = Path.Combine(workflowScriptsDirectory, $"{scriptName}.py");
    var nodeIdScriptPath = Path.Combine(workflowScriptsDirectory, $"{nodeId}.py");
    var legacyScriptPath = Path.Combine(
        legacyScriptsDirectory,
        projectName,
        workflowName,
        $"{nodeId}.py"
    );

    if (
        !File.Exists(scriptPath)
        && File.Exists(flatScriptPath)
    )
    {
        Directory.CreateDirectory(scriptDirectory);
        File.Move(flatScriptPath, scriptPath);
    }

    if (
        !File.Exists(scriptPath)
        && !string.Equals(flatScriptPath, nodeIdScriptPath, StringComparison.Ordinal)
        && File.Exists(nodeIdScriptPath)
    )
    {
        Directory.CreateDirectory(scriptDirectory);
        File.Move(nodeIdScriptPath, scriptPath);
    }

    if (!File.Exists(scriptPath) && File.Exists(legacyScriptPath))
    {
        Directory.CreateDirectory(scriptDirectory);
        File.Move(legacyScriptPath, scriptPath);
    }

    if (!File.Exists(scriptPath) && !Directory.Exists(scriptDirectory))
    {
        var trashedScriptsDirectory = Path.Combine(
            trashDirectory,
            "projects",
            projectName,
            workflowName,
            "python-scripts"
        );
        var trashedScriptDirectory = Directory.Exists(trashedScriptsDirectory)
            ? Directory
                .EnumerateDirectories(trashedScriptsDirectory, $"*-{scriptName}")
                .Concat(Directory.EnumerateDirectories(
                    trashedScriptsDirectory,
                    $"*-{nodeId}"
                ))
                .OrderDescending()
                .FirstOrDefault()
            : null;

        if (trashedScriptDirectory is not null)
        {
            Directory.Move(trashedScriptDirectory, scriptDirectory);
        }
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
            Directory.CreateDirectory(scriptDirectory);
            File.Move(trashedScriptPath, scriptPath);
        }
    }

    if (!File.Exists(scriptPath))
    {
        Directory.CreateDirectory(scriptDirectory);
        await File.WriteAllTextAsync(scriptPath, GetDefaultPythonScript());
    }

        return scriptPath;
    }
    finally
    {
        pythonScriptFileLock.Release();
    }
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

        Step folder: {{scriptName}}
        Entry file: main.py

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

static async Task<CodexAuthResponse> GetCodexAuthStatus(
    string codexCommand,
    string workingDirectory,
    int timeoutSeconds
)
{
    var result = await RunLocalCommand(
        $"{codexCommand} login status",
        workingDirectory,
        timeoutSeconds
    );
    var combinedOutput = string.Join(
        Environment.NewLine,
        new[] { result.Output, result.Error }
            .Where(value => !string.IsNullOrWhiteSpace(value))
    ).Trim();

    if (
        result.IsSuccess
        && combinedOutput.Contains("Logged in", StringComparison.OrdinalIgnoreCase)
    )
    {
        var method = combinedOutput.Contains(
            "API key",
            StringComparison.OrdinalIgnoreCase
        )
            ? "api_key"
            : combinedOutput.Contains("ChatGPT", StringComparison.OrdinalIgnoreCase)
                ? "chatgpt"
                : "codex";

        return new CodexAuthResponse(true, true, method, null);
    }

    if (
        combinedOutput.Contains("not logged in", StringComparison.OrdinalIgnoreCase)
        || combinedOutput.Contains("signed out", StringComparison.OrdinalIgnoreCase)
    )
    {
        return new CodexAuthResponse(false, true, null, null);
    }

    if (
        combinedOutput.Contains("command not found", StringComparison.OrdinalIgnoreCase)
        || combinedOutput.Contains("not recognized", StringComparison.OrdinalIgnoreCase)
        || combinedOutput.Contains("No such file", StringComparison.OrdinalIgnoreCase)
    )
    {
        return new CodexAuthResponse(
            false,
            false,
            null,
            "Codex CLI is not installed or is not available on PATH."
        );
    }

    return new CodexAuthResponse(
        false,
        true,
        null,
        string.IsNullOrWhiteSpace(combinedOutput)
            ? "Could not determine the Codex sign-in status."
            : combinedOutput
    );
}

static Process? StartCodexLogin(string codexCommand, string workingDirectory)
{
    try
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = OperatingSystem.IsWindows() ? "cmd.exe" : "/bin/zsh",
            WorkingDirectory = workingDirectory,
            UseShellExecute = false,
        };

        if (OperatingSystem.IsWindows())
        {
            startInfo.ArgumentList.Add("/c");
        }
        else
        {
            startInfo.ArgumentList.Add("-lc");
        }

        startInfo.ArgumentList.Add($"{codexCommand} login");

        return Process.Start(startInfo);
    }
    catch
    {
        return null;
    }
}

static async Task<LocalAiCommandResult> RunLocalCommand(
    string commandLine,
    string workingDirectory,
    int timeoutSeconds
)
{
    try
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = OperatingSystem.IsWindows() ? "cmd.exe" : "/bin/zsh",
            WorkingDirectory = workingDirectory,
            UseShellExecute = false,
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
            return new LocalAiCommandResult(false, "", "Could not start the command.");
        }

        var outputTask = process.StandardOutput.ReadToEndAsync();
        var errorTask = process.StandardError.ReadToEndAsync();

        using var timeout = new CancellationTokenSource(
            TimeSpan.FromSeconds(timeoutSeconds)
        );

        try
        {
            await process.WaitForExitAsync(timeout.Token);
        }
        catch (OperationCanceledException)
        {
            process.Kill(entireProcessTree: true);
            return new LocalAiCommandResult(false, "", "The command timed out.");
        }

        var output = (await outputTask).Trim();
        var error = (await errorTask).Trim();

        return new LocalAiCommandResult(process.ExitCode == 0, output, error);
    }
    catch (Exception exception)
    {
        return new LocalAiCommandResult(false, "", exception.Message);
    }
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

static async Task<string?> OpenPythonScript(
    string workspaceDirectory,
    string scriptPath,
    string openTarget,
    string? configuredVisualStudioCodeCommand
)
{
    var targetLabel = openTarget switch
    {
        "vscode" => "Visual Studio Code",
        "cursor" => "Cursor",
        "finder" => "Finder",
        "terminal" => "Terminal",
        "ghostty" => "Ghostty",
        "xcode" => "Xcode",
        _ => "the selected application",
    };

    try
    {
        var startInfo = new ProcessStartInfo
        {
            UseShellExecute = false,
            RedirectStandardError = true,
        };

        if (
            openTarget == "vscode"
            && !string.IsNullOrWhiteSpace(configuredVisualStudioCodeCommand)
        )
        {
            startInfo.FileName = configuredVisualStudioCodeCommand;
            startInfo.ArgumentList.Add(workspaceDirectory);
            startInfo.ArgumentList.Add(scriptPath);
        }
        else if (OperatingSystem.IsMacOS())
        {
            if (openTarget == "vscode")
            {
                var visualStudioCodeCommand =
                    "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code";

                if (File.Exists(visualStudioCodeCommand))
                {
                    startInfo.FileName = visualStudioCodeCommand;
                    startInfo.ArgumentList.Add("--reuse-window");
                    startInfo.ArgumentList.Add(workspaceDirectory);
                    startInfo.ArgumentList.Add(scriptPath);
                }
                else
                {
                    AddMacOpenApplicationArguments(
                        startInfo,
                        "Visual Studio Code",
                        workspaceDirectory,
                        scriptPath
                    );
                }
            }
            else if (openTarget == "cursor")
            {
                var cursorCommand =
                    "/Applications/Cursor.app/Contents/Resources/app/bin/cursor";

                if (File.Exists(cursorCommand))
                {
                    startInfo.FileName = cursorCommand;
                    startInfo.ArgumentList.Add("--reuse-window");
                    startInfo.ArgumentList.Add(workspaceDirectory);
                    startInfo.ArgumentList.Add(scriptPath);
                }
                else
                {
                    AddMacOpenApplicationArguments(
                        startInfo,
                        "Cursor",
                        workspaceDirectory,
                        scriptPath
                    );
                }
            }
            else if (openTarget == "finder")
            {
                startInfo.FileName = "open";
                startInfo.ArgumentList.Add("-R");
                startInfo.ArgumentList.Add(workspaceDirectory);
            }
            else if (openTarget == "ghostty")
            {
                startInfo.FileName = "open";
                startInfo.ArgumentList.Add("-a");
                startInfo.ArgumentList.Add("Ghostty");
                startInfo.ArgumentList.Add("--args");
                startInfo.ArgumentList.Add($"--working-directory={workspaceDirectory}");
            }
            else
            {
                AddMacOpenApplicationArguments(
                    startInfo,
                    targetLabel,
                    openTarget == "terminal" ? workspaceDirectory : scriptPath
                );
            }
        }
        else if (openTarget is "vscode" or "cursor")
        {
            var command = openTarget == "vscode" ? "code" : "cursor";
            startInfo.FileName = OperatingSystem.IsWindows()
                ? $"{command}.cmd"
                : command;
            startInfo.ArgumentList.Add("--reuse-window");
            startInfo.ArgumentList.Add(workspaceDirectory);
            startInfo.ArgumentList.Add(scriptPath);
        }
        else if (openTarget == "finder")
        {
            startInfo.FileName = OperatingSystem.IsWindows() ? "explorer.exe" : "xdg-open";
            startInfo.ArgumentList.Add(
                OperatingSystem.IsWindows()
                    ? $"/select,{workspaceDirectory}"
                    : workspaceDirectory
            );
        }
        else
        {
            return $"Opening in {targetLabel} is currently supported on macOS.";
        }

        using var process = Process.Start(startInfo);

        if (process is null)
        {
            return $"Could not start {targetLabel}.";
        }

        var standardErrorTask = process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();
        var standardError = await standardErrorTask;

        return process.ExitCode == 0
            ? null
            : string.IsNullOrWhiteSpace(standardError)
                ? $"{targetLabel} could not open the Python script."
                : standardError.Trim();
    }
    catch (Exception exception)
    {
        return $"Could not open {targetLabel}: {exception.Message}";
    }
}

static void AddMacOpenApplicationArguments(
    ProcessStartInfo startInfo,
    string applicationName,
    params string[] paths
)
{
    startInfo.FileName = "open";
    startInfo.ArgumentList.Add("-a");
    startInfo.ArgumentList.Add(applicationName);

    foreach (var path in paths)
    {
        startInfo.ArgumentList.Add(path);
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
    string? ScriptName,
    string? Target
);

record RenamePythonScriptRequest(
    string ProjectName,
    string WorkflowName,
    string NodeId,
    string? ScriptName,
    string NextScriptName
);

record PythonScriptResponse(string Path);

record PythonScriptContentResponse(string Path, string Code);

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

record CodexAuthResponse(
    bool Authenticated,
    bool Available,
    string? Method,
    string? Error
);

record CodexLoginResponse(bool Started);

record LocalAiCommandResult(bool IsSuccess, string Output, string Error);

record ErrorResponse(string Error);

record ConflictResponse(string Error, int CurrentRevision);

using System.Diagnostics;
using System.Text.Json;
using Microsoft.Data.Sqlite;

const string workspaceId = "default";
const int maximumWorkspaceBytes = 2 * 1024 * 1024;

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
    if (
        !IsSafePathSegment(request.ProjectName)
        || !IsSafePathSegment(request.WorkflowName)
        || !IsSafePathSegment(request.NodeId)
    )
    {
        return Results.BadRequest(new ErrorResponse("Invalid Python script identifier."));
    }

    var workflowScriptsDirectory = Path.Combine(
        projectsDirectory,
        request.ProjectName,
        request.WorkflowName,
        "python-scripts"
    );
    Directory.CreateDirectory(workflowScriptsDirectory);

    var scriptPath = Path.Combine(workflowScriptsDirectory, $"{request.NodeId}.py");
    var legacyScriptPath = Path.Combine(
        legacyScriptsDirectory,
        request.ProjectName,
        request.WorkflowName,
        $"{request.NodeId}.py"
    );

    if (!File.Exists(scriptPath) && File.Exists(legacyScriptPath))
    {
        File.Move(legacyScriptPath, scriptPath);
    }

    if (!File.Exists(scriptPath))
    {
        var trashedScriptsDirectory = Path.Combine(
            trashDirectory,
            "projects",
            request.ProjectName,
            request.WorkflowName,
            "python-scripts"
        );
        var trashedScriptPath = Directory.Exists(trashedScriptsDirectory)
            ? Directory
                .EnumerateFiles(trashedScriptsDirectory, $"*-{request.NodeId}.py")
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
        await File.WriteAllTextAsync(
            scriptPath,
            """
            # Papliba Python script

            def main(input_data):
                # Transform the workflow input and return the result.
                return input_data
            """
        );
    }

    var openError = await OpenInVisualStudioCode(
        Path.Combine(projectsDirectory, request.ProjectName, request.WorkflowName),
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
    if (
        !IsSafePathSegment(request.ProjectName)
        || !IsSafePathSegment(request.WorkflowName)
        || !IsSafePathSegment(request.NodeId)
    )
    {
        return Results.BadRequest(new ErrorResponse("Invalid Python script identifier."));
    }

    var scriptPath = Path.Combine(
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

    var trashName = $"{DateTimeOffset.UtcNow:yyyyMMddHHmmssfff}-{request.NodeId}.py";
    var trashPath = Path.Combine(trashedScriptsDirectory, trashName);
    File.Move(sourcePath, trashPath);

    return Results.Ok(new PythonScriptTrashResponse(true, trashPath));
});

app.Run();

static bool IsSafePathSegment(string value)
{
    return !string.IsNullOrWhiteSpace(value)
        && value.Length <= 120
        && value.All(character =>
            char.IsAsciiLetterOrDigit(character) || character is '-' or '_'
        );
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

record OpenPythonScriptRequest(string ProjectName, string WorkflowName, string NodeId);

record PythonScriptResponse(string Path);

record PythonScriptTrashResponse(bool Trashed, string? Path);

record ErrorResponse(string Error);

record ConflictResponse(string Error, int CurrentRevision);

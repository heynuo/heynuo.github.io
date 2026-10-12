[CmdletBinding()]
param(
    [ValidateRange(1, 65535)]
    [int]$Port = 8080,

    [string]$Root = (Join-Path $PSScriptRoot '..'),

    [string]$BindAddress = '127.0.0.1'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

try {
    $rootPath = [System.IO.Path]::GetFullPath((Resolve-Path -LiteralPath $Root -ErrorAction Stop).ProviderPath)
} catch {
    Write-Error "Site root '$Root' could not be found: $($_.Exception.Message)"
    exit 2
}

$rootPrefix = $rootPath.TrimEnd([char[]]@('\', '/')) + [System.IO.Path]::DirectorySeparatorChar
$prefix = "http://${BindAddress}:$Port/"
$mimeTypes = @{
    '.avif' = 'image/avif'
    '.css' = 'text/css; charset=utf-8'
    '.gif' = 'image/gif'
    '.htm' = 'text/html; charset=utf-8'
    '.html' = 'text/html; charset=utf-8'
    '.ico' = 'image/x-icon'
    '.jpeg' = 'image/jpeg'
    '.jpg' = 'image/jpeg'
    '.js' = 'text/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.mjs' = 'text/javascript; charset=utf-8'
    '.mp3' = 'audio/mpeg'
    '.otf' = 'font/otf'
    '.pdf' = 'application/pdf'
    '.png' = 'image/png'
    '.svg' = 'image/svg+xml'
    '.txt' = 'text/plain; charset=utf-8'
    '.ttf' = 'font/ttf'
    '.wasm' = 'application/wasm'
    '.webmanifest' = 'application/manifest+json; charset=utf-8'
    '.webm' = 'video/webm'
    '.webp' = 'image/webp'
    '.woff' = 'font/woff'
    '.woff2' = 'font/woff2'
    '.xml' = 'application/xml; charset=utf-8'
}

function Resolve-SiteRequestPath {
    param([Parameter(Mandatory)][string]$UrlPath)

    $decodedPath = [System.Uri]::UnescapeDataString($UrlPath)
    if ($decodedPath.IndexOf([char]0) -ge 0) { throw [System.UnauthorizedAccessException]::new('Invalid URL path.') }

    $relativePath = $decodedPath.TrimStart([char[]]@('/', '\'))
    if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }
    $relativePath = $relativePath.Replace('/', [System.IO.Path]::DirectorySeparatorChar).Replace('\', [System.IO.Path]::DirectorySeparatorChar)

    $filePath = [System.IO.Path]::GetFullPath((Join-Path $rootPath $relativePath))
    $isInsideRoot = $filePath.Equals($rootPath, [System.StringComparison]::OrdinalIgnoreCase) -or
        $filePath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)
    if (-not $isInsideRoot) { throw [System.UnauthorizedAccessException]::new('Requested path is outside the site root.') }

    if ([System.IO.Directory]::Exists($filePath)) { $filePath = Join-Path $filePath 'index.html' }
    return $filePath
}

function Write-TextResponse {
    param(
        [Parameter(Mandatory)][System.Net.HttpListenerResponse]$Response,
        [Parameter(Mandatory)][int]$StatusCode,
        [Parameter(Mandatory)][string]$Text,
        [switch]$HeadOnly
    )

    $body = [System.Text.Encoding]::UTF8.GetBytes($Text)
    $Response.StatusCode = $StatusCode
    $Response.ContentType = 'text/plain; charset=utf-8'
    $Response.ContentLength64 = $body.Length
    if (-not $HeadOnly -and $Response.OutputStream.CanWrite) { $Response.OutputStream.Write($body, 0, $body.Length) }
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "Serving '$rootPath' at $prefix (Ctrl+C to stop)." -ForegroundColor Green

    while ($listener.IsListening) {
        $context = $null
        try {
            $context = $listener.GetContext()
        } catch [System.Net.HttpListenerException] {
            if (-not $listener.IsListening) { break }
            throw
        }

        $response = $context.Response
        $fileStream = $null
        try {
            $method = $context.Request.HttpMethod.ToUpperInvariant()
            if ($method -ne 'GET' -and $method -ne 'HEAD') {
                $response.Headers['Allow'] = 'GET, HEAD'
                Write-TextResponse -Response $response -StatusCode 405 -Text 'Method Not Allowed'
                continue
            }

            try {
                $filePath = Resolve-SiteRequestPath -UrlPath $context.Request.Url.AbsolutePath
            } catch [System.UnauthorizedAccessException] {
                Write-TextResponse -Response $response -StatusCode 403 -Text 'Forbidden' -HeadOnly:($method -eq 'HEAD')
                continue
            }

            if (-not [System.IO.File]::Exists($filePath)) {
                Write-TextResponse -Response $response -StatusCode 404 -Text '404 Not Found' -HeadOnly:($method -eq 'HEAD')
                continue
            }

            $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
            $contentType = if ($mimeTypes.ContainsKey($extension)) { $mimeTypes[$extension] } else { 'application/octet-stream' }
            $fileStream = [System.IO.File]::OpenRead($filePath)
            $response.StatusCode = 200
            $response.ContentType = $contentType
            $response.ContentLength64 = $fileStream.Length
            $response.Headers['Cache-Control'] = 'no-cache'
            $response.Headers['X-Content-Type-Options'] = 'nosniff'

            if ($method -eq 'GET') { $fileStream.CopyTo($response.OutputStream) }
        } catch {
            Write-Warning "Request '$($context.Request.RawUrl)' failed: $($_.Exception.Message)"
            try { Write-TextResponse -Response $response -StatusCode 500 -Text '500 Internal Server Error' } catch { }
        } finally {
            if ($null -ne $fileStream) { $fileStream.Dispose() }
            try { $response.Close() } catch { }
        }
    }
} catch {
    Write-Error "Server failed on $prefix: $($_.Exception.Message)"
    exit 1
} finally {
    if ($listener.IsListening) { $listener.Stop() }
    $listener.Close()
}

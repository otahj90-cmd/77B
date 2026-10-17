$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$previewPython = Get-Command python -ErrorAction SilentlyContinue
if ($previewPython) {
    Write-Host '77B preview: http://127.0.0.1:8000'
    & $previewPython.Source -m http.server 8000 --bind 127.0.0.1
    exit $LASTEXITCODE
}
$previewNode = Get-Command node -ErrorAction SilentlyContinue
if ($previewNode) {
    & $previewNode.Source (Join-Path $PSScriptRoot 'tools/serve.mjs')
    exit $LASTEXITCODE
}
$bundledPreviewNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
if (Test-Path -LiteralPath $bundledPreviewNode) {
    & $bundledPreviewNode (Join-Path $PSScriptRoot 'tools/serve.mjs')
    exit $LASTEXITCODE
}
Write-Host '请使用已安装的Python/Node静态服务器，或将完整源码上传到GitHub Pages。'
exit 1

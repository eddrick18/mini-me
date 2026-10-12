$ErrorActionPreference = 'Stop'
$riveCli = Join-Path $env:USERPROFILE '.rive\bin\rive.exe'
& $riveCli character/source --verify
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$inspection = & $riveCli inspect character/source --json
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$inspectionObject = $inspection | ConvertFrom-Json
if ($inspectionObject.problems.Count -ne 0) {
    $inspectionObject.problems | Format-Table
    exit 1
}
& $riveCli character/source --once
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
New-Item -ItemType Directory -Force assets/character | Out-Null
Copy-Item -LiteralPath 'character/source/build/compatibility-character.riv' -Destination 'assets/character/compatibility-character.riv'
$manifestPath = 'assets/character/manifest.json'
$manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$manifest | Add-Member -NotePropertyName sha256 -NotePropertyValue ((Get-FileHash 'assets/character/compatibility-character.riv' -Algorithm SHA256).Hash.ToLowerInvariant()) -Force
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestPath -Encoding utf8
Write-Output 'Character verified, inspected, and exported locally.'

& $riveCli character/interactions --verify
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $riveCli character/interactions --once
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Copy-Item -LiteralPath 'character/interactions/build/companion-reactions.riv' -Destination 'assets/character/companion-reactions.riv'
$reactionManifestPath = 'assets/character/companion-reactions.json'
$reactionManifest = Get-Content -LiteralPath $reactionManifestPath -Raw | ConvertFrom-Json
$reactionManifest.sha256 = (Get-FileHash 'assets/character/companion-reactions.riv' -Algorithm SHA256).Hash.ToLowerInvariant()
$reactionManifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $reactionManifestPath -Encoding utf8
Write-Output 'Companion reaction badge verified and exported locally.'

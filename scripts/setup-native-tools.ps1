$ErrorActionPreference = 'Stop'
$toolCache = Join-Path $env:TEMP 'mini-me-tools'
New-Item -ItemType Directory -Force $toolCache | Out-Null
$archiveName = 'cmake-3.31.6-windows-x86_64.zip'
$archivePath = Join-Path $toolCache $archiveName
$expectedHash = 'd163cd3ab4959b0a53fa8988f2ddbd2e6c501658201e6a154386bad9dbe4f836'
if (-not (Test-Path -LiteralPath $archivePath) -or (Get-FileHash $archivePath -Algorithm SHA256).Hash -ne $expectedHash) {
    Invoke-WebRequest "https://github.com/Kitware/CMake/releases/download/v3.31.6/$archiveName" -OutFile $archivePath
}
if ((Get-FileHash $archivePath -Algorithm SHA256).Hash -ne $expectedHash) { throw 'CMake checksum mismatch.' }
$cmakeRoot = Join-Path $toolCache 'cmake-3.31.6-windows-x86_64'
if (-not (Test-Path -LiteralPath (Join-Path $cmakeRoot 'bin/cmake.exe'))) {
    Expand-Archive -LiteralPath $archivePath -DestinationPath $toolCache -Force
}
$sdkRoot = $env:ANDROID_HOME
if (-not $sdkRoot) { $sdkRoot = Join-Path $env:LOCALAPPDATA 'Android/Sdk' }
Copy-Item -LiteralPath (Join-Path $sdkRoot 'cmake/3.22.1/bin/ninja.exe') -Destination (Join-Path $cmakeRoot 'bin/ninja.exe') -Force
& (Join-Path $cmakeRoot 'bin/cmake.exe') --version
if ($LASTEXITCODE -ne 0) { throw 'CMake tool check failed.' }

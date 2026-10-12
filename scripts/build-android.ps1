param([switch]$BuildOnly)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-17.0.12'
$env:JAVA_TOOL_OPTIONS = '-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8'
$env:CMAKE_VERSION = '3.31.6'
$env:NODE_ENV = 'development'
$sdkRoot = $env:ANDROID_HOME
if (-not $sdkRoot) { $sdkRoot = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$env:ANDROID_HOME = $sdkRoot
$adbPath = Join-Path $sdkRoot 'platform-tools\adb.exe'
$nativeStage = Join-Path $env:TEMP 'mini-me-native-build'
$sourceMarker = Join-Path $nativeStage '.mini-me-origin'
if (Test-Path -LiteralPath $nativeStage) {
    if (-not (Test-Path -LiteralPath $sourceMarker) -or (Get-Content -LiteralPath $sourceMarker -Raw).Trim() -ne $projectRoot) {
        throw 'Temporary build folder belongs to another project or has no origin marker.'
    }
    $configurationChanged = $false
    foreach ($config in @('package-lock.json', 'app.json')) {
        if ((Get-FileHash (Join-Path $nativeStage $config)).Hash -ne (Get-FileHash (Join-Path $projectRoot $config)).Hash) { $configurationChanged = $true }
    }
    if ($configurationChanged) {
        $configHashes = @('package-lock.json', 'app.json') | ForEach-Object { (Get-FileHash (Join-Path $projectRoot $_)).Hash }
        $fingerprint = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes(($configHashes -join ':')))).Substring(0, 12)
        $nativeStage = Join-Path $env:TEMP ('mini-me-native-' + $fingerprint)
        if (Test-Path -LiteralPath $nativeStage) {
            $cachedMarker = Join-Path $nativeStage '.mini-me-origin'
            if (-not (Test-Path -LiteralPath $cachedMarker) -or (Get-Content -LiteralPath $cachedMarker -Raw).Trim() -ne $projectRoot) { throw 'Cached build folder belongs to another project.' }
        }
    }
}
if ($nativeStage -match '[^\x00-\x7F]') { throw 'Use an ASCII TEMP path for the Windows native build.' }
New-Item -ItemType Directory -Force $nativeStage | Out-Null
Set-Content -LiteralPath (Join-Path $nativeStage '.mini-me-origin') -Value $projectRoot -Encoding utf8
foreach ($item in @('app', 'src', 'assets', 'package.json', 'package-lock.json', 'app.json', 'tsconfig.json', 'metro.config.js')) {
    Copy-Item -LiteralPath (Join-Path $projectRoot $item) -Destination $nativeStage -Recurse -Force
}
if (-not (Test-Path -LiteralPath (Join-Path $nativeStage 'node_modules/expo/package.json'))) {
    Push-Location $nativeStage
    try { & npm.cmd ci }
    finally { Pop-Location }
    if ($LASTEXITCODE -ne 0) { throw 'Locked dependency installation failed.' }
}
& (Join-Path $PSScriptRoot 'setup-native-tools.ps1')
$nativeProject = Join-Path $nativeStage 'android'
if (-not (Test-Path -LiteralPath $nativeProject)) {
    Push-Location $nativeStage
    try { & npx.cmd expo prebuild --platform android --no-install }
    finally { Pop-Location }
    if ($LASTEXITCODE -ne 0) { throw 'Expo native project generation failed.' }
}
$cmakeRoot = Join-Path $env:TEMP 'mini-me-tools/cmake-3.31.6-windows-x86_64'
('cmake.dir=' + $cmakeRoot.Replace('\', '/')) | Set-Content -LiteralPath (Join-Path $nativeProject 'local.properties') -Encoding ascii
Push-Location $nativeProject
try {
    & (Join-Path $env:JAVA_HOME 'bin\java.exe') -Xmx64m -Xms64m -jar 'gradle\wrapper\gradle-wrapper.jar' app:assembleDebug -PreactNativeArchitectures=x86_64 --max-workers=2 --console=plain
    if ($LASTEXITCODE -ne 0) { throw 'Android build failed. Review the Gradle error above.' }
} finally { Pop-Location }
if ($BuildOnly) { return }
$devices = & $adbPath devices
if (-not ($devices -match '^emulator-\d+\s+device$')) {
    $emulatorPath = Join-Path $sdkRoot 'emulator/emulator.exe'
    $availableAvds = & $emulatorPath -list-avds
    if ($availableAvds -notcontains 'Pixel_4') { throw 'Create the Pixel_4 API36 x86_64 emulator before running this script.' }
    Start-Process -FilePath $emulatorPath -ArgumentList @('-avd', 'Pixel_4', '-no-snapshot-load') -WindowStyle Hidden
    $bootDeadline = [DateTime]::UtcNow.AddMinutes(2)
    do {
        Start-Sleep -Seconds 2
        $devices = & $adbPath devices
        if ($devices -match '^emulator-\d+\s+device$') { $booted = ([string](& $adbPath -e shell getprop sys.boot_completed)).Trim() -eq '1' }
    } until ($booted -or [DateTime]::UtcNow -gt $bootDeadline)
    if (-not $booted) { throw 'Emulator did not finish booting within two minutes.' }
}
$userState = & $adbPath -e shell dumpsys user
if ($userState -match '0=RUNNING_LOCKED') { throw 'Swipe up to unlock the Android Emulator, then rerun npm run android.' }
& $adbPath -e install -r (Join-Path $nativeProject 'app\build\outputs\apk\debug\app-debug.apk')
if ($LASTEXITCODE -ne 0) { throw 'App installation failed.' }
& $adbPath -e reverse tcp:8081 tcp:8081
$launchOutput = & $adbPath -e shell am start -W -n 'com.personal.minime/.MainActivity' -a android.intent.action.VIEW -d 'minime://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081' 2>&1
$launchOutput | Write-Output
if ($LASTEXITCODE -ne 0 -or $launchOutput -match '^Error:') { throw 'Development app launch failed.' }
Write-Output 'Development app opened. Keep npm start running in a separate terminal.'




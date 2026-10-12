$ErrorActionPreference='Stop'
$env:NODE_OPTIONS=($env:NODE_OPTIONS+' --dns-result-order=ipv4first').Trim()
& npx.cmd expo start --go --lan --port 8082 @args
exit $LASTEXITCODE

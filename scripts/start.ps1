$ErrorActionPreference = 'Stop'
# ADB reverse connects to IPv4; Node otherwise resolves localhost to ::1 on this Windows host.
$env:NODE_OPTIONS = ($env:NODE_OPTIONS + ' --dns-result-order=ipv4first').Trim()
& npx.cmd expo start --dev-client --localhost --port 8081 @args
exit $LASTEXITCODE

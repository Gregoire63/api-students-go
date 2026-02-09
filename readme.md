rem Compiler pour Windows
set GOOS=windows
set GOARCH=amd64
go build -o api-windows.exe

rem Compiler pour macOS
set GOOS=darwin
set GOARCH=amd64
go build -o api-macos

rem Compiler pour Linux
set GOOS=linux
set GOARCH=amd64
go build -o api-linux


update package
go mod tidy
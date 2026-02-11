rem Compiler pour Windows
set GOOS=windows
set GOARCH=amd64
go build -o ./dist/api-windows.exe

rem Compiler pour Linux
set GOOS=linux
set GOARCH=amd64
go build -o ./dist/api-linux

rem Compiler pour macOS
set GOOS=darwin
set GOARCH=amd64
go build -o ./dist/api-macos

update package
go mod tidy
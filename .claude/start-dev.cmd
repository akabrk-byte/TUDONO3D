@echo off
set "NODE_DIR=C:\Users\alecs\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.14.0-win-x64"
set "PATH=%NODE_DIR%;%PATH%"
cd /d "G:\Users\alecs\Downloads\tudono3d"
"%NODE_DIR%\npm.cmd" run dev

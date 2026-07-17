@echo off
chcp 65001 >nul
REM 启动本地静态服务器（手势摄像头需要 localhost，不能直接双击 html）
cd /d "%~dp0"
echo.
echo  正在启动命运之环，浏览器将自动打开：
echo  http://localhost:8080/
echo.
echo  关闭本窗口即可停止服务。
echo.
start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 800; Start-Process 'http://localhost:8080/'"
python -m http.server 8080

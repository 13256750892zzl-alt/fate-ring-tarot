@echo off
REM 启动本地静态服务器（手势摄像头需要 localhost，不能直接双击 html）
cd /d "%~dp0"
echo.
echo  命运之环已启动，请在浏览器打开下方地址：
echo  http://localhost:8080/
echo.
echo  关闭本窗口即可停止服务。
echo.
python -m http.server 8080

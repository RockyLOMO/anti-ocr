@echo off
set DEST=D:\home\.shell\rime_anti

echo Deploying Anti-OCR files to %DEST%...
if not exist "%DEST%" mkdir "%DEST%"

copy /Y daemon.py "%DEST%\"
copy /Y start.bat "%DEST%\"
copy /Y cli.js "%DEST%\"
copy /Y package.json "%DEST%\"

echo.
echo Deployment successful! 
echo Make sure to run 'npm install' in the destination folder if you use this on a new machine.
echo.
pause

@echo off
REM Get current script dir
set "script_dir=%~dp0"

echo Script dir is: %script_dir%

REM Copy the entire assets folder to C:\
xcopy "%script_dir%assets" "C:\assets\" /E /I /Y

REM Run the script from the copied location
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\assets\start_hash_upload.ps1"

pause

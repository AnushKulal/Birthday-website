@echo off
title Birthday website
cd /d "%~dp0"

py --version >nul 2>&1
if not errorlevel 1 (
  py serve.py
  goto done
)

python --version >nul 2>&1
if not errorlevel 1 (
  python serve.py
  goto done
)

echo.
echo   Python was not found.
echo   Install it from https://www.python.org/downloads/
echo   (tick "Add python.exe to PATH" during install), then double-click this file again.

:done
echo.
pause

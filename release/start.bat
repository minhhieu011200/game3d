@echo off
rem Bam dup file nay de mo Tro choi Toan 1 (khong can mang).
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
if errorlevel 1 pause

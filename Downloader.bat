@echo off
cd /d "%~dp0"

set /p dominio=Enter the full domain (ex: https://ejemplo.com): 
set /p usarflash=Do you want to get support for Adobe Flash (Ruffle)? (S/N): 

setlocal enabledelayedexpansion
set "flashflag="
if /i "%usarflash%"=="S" set flashflag=--flash
if /i "%usarflash%"=="N" set flashflag=--no-flash

bin\downloader.exe %dominio% !flashflag!

pause
@echo off
cd /d "%~dp0"
title Anti-OCR Daemon
echo Starting Anti-OCR Daemon...
python daemon.py
pause

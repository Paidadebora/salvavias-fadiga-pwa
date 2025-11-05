@echo off
setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

REM ============================================================
REM Deploy PWA to GitHub Pages using a Personal Access Token
REM Repo: https://github.com/paidadebora/salvavias-fadiga-pwa.git
REM Usage: double-click this .bat from the project folder
REM ============================================================

cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Git nao encontrado no PATH. Instale: https://git-scm.com/downloads
  pause
  exit /b 1
)

echo.
echo === Deploy PWA para GitHub Pages (branch main) ===
echo Repositorio-alvo: https://github.com/paidadebora/salvavias-fadiga-pwa.git
echo.

set /p GHTOKEN=Cole seu GitHub Personal Access Token (repo): 
if "%GHTOKEN%"=="" (
  echo [ERRO] Token nao informado. Abortando.
  pause
  exit /b 1
)
echo.

if not exist ".git" (
  git init
)

for /f "delims=" %%A in ('git config --get user.name 2^>nul') do set GUSER=%%A
for /f "delims=" %%A in ('git config --get user.email 2^>nul') do set GMAIL=%%A

if "%GUSER%"=="" git config user.name "Local User"
if "%GMAIL%"=="" git config user.email "local@example.com"

git add -A
git commit -m "Deploy inicial: PWA Fadiga Offline" 1>nul 2>nul

git branch -M main

echo.
echo [INFO] Enviando para o GitHub (sem salvar token)...
git -c http.extraheader="Authorization: token %GHTOKEN%" push -u https://github.com/paidadebora/salvavias-fadiga-pwa.git main
if errorlevel 1 (
  echo.
  echo [ERRO] Falha no push. Verifique se o repositorio existe, se o token tem permissao 'repo',
  echo        e se seu firewall/proxy nao bloqueia HTTPS.
  set "GHTOKEN="
  pause
  exit /b 1
)

set "GHTOKEN="

echo.
echo [OK] Push concluido.
echo Ative o Pages: GitHub ^> Settings ^> Pages ^> Source = GitHub Actions.
echo URL esperada: https://paidadebora.github.io/salvavias-fadiga-pwa/
echo.
pause
exit /b 0

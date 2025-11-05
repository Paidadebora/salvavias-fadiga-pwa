#!/usr/bin/env bash
set -e
USER="paidadebora"
REPO="salvavias-fadiga-pwa"
command -v git >/dev/null || { echo "git não encontrado. Instale: https://git-scm.com/downloads"; exit 1; }

git init
git add .
git commit -m "Primeiro commit: PWA Fadiga Offline" >/dev/null 2>&1 || true
git branch -M main
git remote remove origin >/dev/null 2>&1 || true
git remote add origin "https://github.com/${USER}/${REPO}.git"
git push -u origin main

echo "OK. Ative o Pages: Settings → Pages → Source = GitHub Actions (workflow já incluso)."
echo "URL esperada: https://${USER}.github.io/${REPO}/"

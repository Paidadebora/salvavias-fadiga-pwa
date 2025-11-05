# Deploy automático para GitHub Pages
# Repositório alvo: https://github.com/paidadebora/salvavias-fadiga-pwa.git
param(
  [string]$User = "paidadebora",
  [string]$Repo = "salvavias-fadiga-pwa"
)
if (!(Get-Command git -ErrorAction SilentlyContinue)) { throw "Git não encontrado no PATH. Instale em https://git-scm.com/downloads" }

git init
git add .
git commit -m "Primeiro commit: PWA Fadiga Offline" 2>$null
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/$User/$Repo.git
git push -u origin main

Write-Host "OK. Ative o Pages: Settings → Pages → Source = GitHub Actions (workflow já incluso)." -ForegroundColor Green
Write-Host "URL esperada: https://$User.github.io/$Repo/" -ForegroundColor Green

#!/bin/bash
echo "🚀 [PRODUÇÃO] Iniciando Deploy Geral..."

# 1. Limpeza de conflitos (O pulo do gato)
# Vamos desligar o ambiente de DEV para ele não roubar a porta 5173
echo "🧹 Limpando processos de Desenvolvimento..."
pm2 delete web-escola-dev || true
pm2 delete api-escola-dev || true

# 2. Atualizando Backend
echo "📦 Atualizando Backend (PROD)..."
cd backend
npm run build
# Usamos o ecosystem para produção
pm2 restart ecosystem.config.js --env production --update-env || pm2 start ecosystem.config.js --env production

# 3. Atualizando Frontend
echo "🌐 Fazendo Build do Frontend (PROD)..."
cd ../frontend
# O segredo: injetamos a URL da porta 4000 (PROD) diretamente no build
VITE_API_URL=http://localhost:4000 VITE_STATUS=production npm run build -- --mode production

# 4. Iniciando Servidor de Produção
echo "⚡ Iniciando servidor estático..."
pm2 delete web-escola || true
pm2 start "serve -s dist -l 5173" --name web-escola

echo "✅ SISTEMA DE PRODUÇÃO ONLINE NA PORTA 5173!"
pm2 status

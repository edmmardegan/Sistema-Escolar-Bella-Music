#!/bin/bash
echo "🚀 [PRODUÇÃO] Iniciando Deploy Geral..."

# 1. Limpeza de processos antigos
# Isso evita o erro EADDRINUSE (porta ocupada)
echo "🧹 Liberando portas e limpando processos..."
pm2 delete web-escola || true
pm2 delete api-escola || true
pm2 delete web-escola-dev || true
pm2 delete api-escola-dev || true

# 2. Atualizando Backend
echo "📦 Atualizando Backend (PROD)..."
cd backend
# Opcional: npm install (caso tenha mudado o package.json)
rm -rf dist
npm run build
# Garante que o PM2 salve essa nova configuração para o próximo reboot do servidor
pm2 restart ecosystem.config.js --env production --update-env || pm2 start ecosystem.config.js --env production

# 3. Atualizando Frontend
echo "🌐 Fazendo Build do Frontend (PROD)..."
cd ../frontend
rm -rf dist
# Injetando a URL da API (Porta 4000 do NestJS)
VITE_API_URL=http://192.168.15.79:4000 npm run build

# 4. Iniciando Servidor de Produção
echo "⚡ Iniciando servidor estático..."
# Usando a porta 4173 como você planejou
pm2 start "serve -s dist -l 4173" --name web-escola

# 5. Salva a configuração atual no PM2 (Para o autostart funcionar certo)
pm2 save

echo "✅ SISTEMA DE PRODUÇÃO ONLINE!"
pm2 status

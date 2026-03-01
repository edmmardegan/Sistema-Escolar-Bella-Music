#!/bin/bash
echo "🛠️ [DESENVOLVIMENTO] Iniciando Deploy Automatizado..."

# 1. Limpeza total de processos para evitar conflitos de porta
echo "🧹 Limpando processos antigos (Prod e Dev)..."
pm2 delete web-escola || true
pm2 delete api-escola || true
pm2 delete web-escola-dev || true
pm2 delete api-escola-dev || true

# 2. Atualizando Backend
echo "📦 Configurando Backend (DEV)..."
cd backend
npm run build

# Forçamos as variáveis do banco de teste
PORT=5000 \
NODE_ENV=development \
DB_DATABASE=escolaron_dev \
DB_PASSWORD=123456 \
pm2 start dist/main.js --name api-escola-dev --update-env --force

# 3. Atualizando Frontend
echo "🌐 Iniciando Frontend (DEV)..."
cd ../frontend
# O segredo: injetamos a URL da porta 5000 (DEV) e limpamos o cache do Vite
rm -rf node_modules/.vite
VITE_API_URL=http://localhost:5000 VITE_STATUS=development pm2 start "npx vite --port 5173 --host" --name web-escola-dev

echo "✅ AMBIENTE DE TESTE (DEV) ONLINE NA PORTA 5173!"
pm2 status

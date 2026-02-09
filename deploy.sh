#!/bin/bash
echo "🚀 Iniciando Deploy Geral..."

echo "📦 Atualizando Backend..."
cd backend && npm run build && pm2 restart api-escola

echo "🌐 Atualizando Frontend..."
cd ../frontend && pm2 restart web-escola

echo "✅ Sistema atualizado com sucesso!"
pm2 status
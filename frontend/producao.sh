#!/bin/bash

# Nome do processo conforme seu pm2 list
APP_NAME="web-escola"

echo "--- [1/5] Parando o PM2 para manutenção ---"
pm2 stop $APP_NAME

echo "--- [2/5] Limpando a porta 4173 (por segurança) ---"
# O fuser mata o processo que o PM2 parou, caso ele tenha ficado 'zumbi'
fuser -k 4173/tcp || true
sleep 1

echo "--- [3/5] Iniciando Build do Vite ---"
# Rodando o build em modo produção
npm run build:prod

echo "--- [4/5] Reiniciando o serviço no PM2 ---"
# O PM2 volta a servir os arquivos novos do build
pm2 start $APP_NAME

echo "--- [5/5] Salvando estado para o Boot do sistema ---"
# Garante que se o servidor desligar, o web-escola volte sozinho
pm2 save

echo "--- ✅ Atualização do $APP_NAME concluída! ---"

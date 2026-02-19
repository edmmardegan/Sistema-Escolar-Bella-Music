#!/bin/bash

# Configurações
DB_NAME="escolaron"
PORT="5433"
BACKUP_DIR="/home/evandro/Documentos/Treinamento/Sistema-Escola-Bella-Music/backup_banco"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILE_NAME="$BACKUP_DIR/backup_${DB_NAME}_$DATE.sql"

# Garante que a pasta existe
mkdir -p $BACKUP_DIR

echo "--- Iniciando backup do Sistema Bella Music ---"

# Garante que o banco esteja online para o pg_dump
sudo pg_ctlcluster 17 main start

echo "Gerando backup em: $FILE_NAME"
sudo -u postgres pg_dump -p $PORT $DB_NAME > $FILE_NAME

# Verifica se o arquivo foi criado com sucesso
if [ -s "$FILE_NAME" ]; then
    echo "✅ Backup concluído com sucesso!"
else
    echo "❌ ERRO: O backup falhou."
fi

# Garante que o serviço continue rodando para o sistema não cair
sudo pg_ctlcluster 17 main start

# =====================================================================
# LIMPEZA AUTOMÁTICA (OPCIONAL)
# A linha abaixo, se desativada (com #), não faz nada.
# Se você remover o #, ela apagará backups com mais de 30 dias.
# find $BACKUP_DIR -name "*.sql" -mtime +30 -exec rm {} \;
# =====================================================================

echo "--- Processo finalizado em $(date) ---"

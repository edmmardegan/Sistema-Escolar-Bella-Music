#!/bin/bash

# ===============================
# BACKUP BANCO - BELLA MUSIC
# ===============================

# Configurações
DB_NAME="escolaron"
PORT="5433"
BACKUP_DIR="/home/evandro/dados/backup/BellaMusic/backup_banco"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILE_NAME="$BACKUP_DIR/backup_${DB_NAME}_$DATE.sql"

echo "--------------------------------------------"
echo " Iniciando backup do Sistema Bella Music"
echo "--------------------------------------------"

# Garante que a pasta existe
mkdir -p "$BACKUP_DIR"

# Verifica se o PostgreSQL está rodando
if ! sudo pg_ctlcluster 17 main status > /dev/null 2>&1; then
    echo "PostgreSQL não está rodando. Iniciando serviço..."
    sudo pg_ctlcluster 17 main start
fi

echo "Gerando backup em: $FILE_NAME"

# Executa o backup
if sudo -u postgres pg_dump -p "$PORT" "$DB_NAME" > "$FILE_NAME"; then
    if [ -s "$FILE_NAME" ]; then
        echo "✅ Backup concluído com sucesso!"
    else
        echo "❌ ERRO: Arquivo criado mas está vazio."
        exit 1
    fi
else
    echo "❌ ERRO: Falha ao executar pg_dump."
    exit 1
fi


# ===============================
# OPÇÃO FUTURA - BACKUP COMPACTADO
# (Descomente quando quiser usar)
# ===============================
# FILE_NAME="$BACKUP_DIR/backup_${DB_NAME}_$DATE.sql.gz"
# sudo -u postgres pg_dump -p "$PORT" "$DB_NAME" | gzip > "$FILE_NAME"


# ===============================
# LIMPEZA AUTOMÁTICA (OPCIONAL)
# Remove backups com mais de 30 dias
# ===============================
# find "$BACKUP_DIR" -name "*.sql" -mtime +30 -exec rm {} \;

echo "Processo finalizado."
echo "--------------------------------------------"

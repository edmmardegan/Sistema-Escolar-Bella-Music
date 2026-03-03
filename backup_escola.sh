#!/bin/bash

# ===============================
# BACKUP BANCO - BELLA MUSIC
# ===============================

# Configurações
DATA=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="/home/evandro/dados/backup/BellaMusic/backup_banco"
ARQUIVO="$BACKUP_DIR/backup_escolaron_$DATA.sql"

# Criar pasta de backup se não existir
mkdir -p "$BACKUP_DIR"

echo "--------------------------------------------"
echo " Iniciando backup do Sistema Bella Music (DOCKER)"
echo "--------------------------------------------"

# Executa o pg_dump DENTRO do container e salva o resultado fora
docker exec db_escola pg_dump -U evandro -d escolaron_dev > "$ARQUIVO"

# Verifica se o arquivo foi criado e se não está vazio
if [ -s "$ARQUIVO" ]; then
    echo "✅ Backup concluído com sucesso!"
    echo "📂 Local: $ARQUIVO"
else
    echo "❌ ERRO: Falha ao gerar o backup via Docker."
    rm -f "$ARQUIVO"
fi

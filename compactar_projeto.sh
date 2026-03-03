#!/bin/bash

# Configurações de pastas
NOME_PROJETO="Sistema-Escola-Bella-Music"
ORIGEM="$HOME/dados/projetos/$NOME_PROJETO"
DESTINO="$HOME/dados//backup/BellaMusic/backup_projeto"
DATA=$(date +%Y-%m-%d_%H-%M)
ARQUIVO="$DESTINO/${NOME_PROJETO}_$DATA.tar.gz"

# Criar pasta de destino se não existir
mkdir -p "$DESTINO"

echo "------------------------------------------------"
echo "📦 Iniciando compactação limpa do projeto..."
echo "------------------------------------------------"

# Compactar excluindo o que é desnecessário
tar -czf "$ARQUIVO" \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="dist" \
    --exclude=".next" \
    --exclude="build" \
    --exclude="db.sqlite" \
    --exclude="*.log" \
    -C "$(dirname "$ORIGEM")" "$NOME_PROJETO"

if [ $? -eq 0 ]; then
    echo "✅ Projeto compactado com sucesso!"
    echo "📂 Local: $ARQUIVO"
    echo "⚖️  Tamanho: $(du -sh "$ARQUIVO" | cut -f1)"
else
    echo "❌ ERRO ao compactar o projeto."
fi

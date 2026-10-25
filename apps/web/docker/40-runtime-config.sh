#!/bin/sh
# Gera /config.js a partir das variáveis de ambiente do container (a cada inicialização).
# O app lê esse arquivo no navegador, então trocar a URL da API não exige novo build.
set -eu

CONFIG_FILE=/usr/share/nginx/html/config.js

# Escapa \ e " para o valor caber dentro de uma string JavaScript.
escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

API_URL="${API_URL:-}"
TENANT="${TENANT:-}"

case "$API_URL" in
  http://* | https://*) ;;
  *)
    echo "ERRO: defina API_URL com a URL completa da API (ex.: https://api.exemplo.com.br)." >&2
    exit 1
    ;;
esac

{
  echo "window.__APP_CONFIG__ = {"
  echo "  apiUrl: \"$(escape "$API_URL")\","
  if [ -n "$TENANT" ]; then
    echo "  tenant: \"$(escape "$TENANT")\","
  fi
  echo "};"
} > "$CONFIG_FILE"

echo "config.js gerado: API_URL=$API_URL${TENANT:+ TENANT=$TENANT}"
#!/bin/bash
set -e
SERVER="deploy@178.105.80.193"
APP_DIR="/home/deploy/apps/ireadit"

echo ">>> Build local..."
npm run build

echo ">>> Push a GitHub..."
git push

echo ">>> Copiar .env al servidor..."
scp .env $SERVER:$APP_DIR/.env

echo ">>> Sincronizar dist al servidor..."
rsync -av dist/ deploy@178.105.80.193:/home/deploy/apps/ireadit/dist/

echo ">>> Deploy en servidor..."
ssh $SERVER "
  cd $APP_DIR
  git pull
  pm2 stop ireadit 2>/dev/null || true
  fuser -k 3110/tcp 2>/dev/null || true
  sleep 2
  NODE_ENV=production GEMINI_API_KEY=$(grep GEMINI_API_KEY .env | cut -d= -f2) PORT=3110 ADMIN_PASSWORD=$(grep ADMIN_PASSWORD .env | cut -d= -f2) pm2 start dist/server.cjs --name ireadit
  pm2 save
  sleep 2
  curl -s http://localhost:3110/api/gutenberg/classics | python3 -c 'import json,sys; d=json.load(sys.stdin); print(f\"✓ {len(d)} libros OK\")'
"
echo ">>> DEPLOY COMPLETADO OK"

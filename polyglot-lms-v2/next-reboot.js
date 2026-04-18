const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const fileContent = `
module.exports = {
  apps: [
    {
      name: 'learning_backend',
      script: 'npm',
      args: 'run start:prod',
      cwd: '/www/wwwroot/learning/polyglot-lms-v2/apps/backend',
      env: {
        PORT: 3001
      }
    },
    {
      name: 'learning_frontend',
      script: 'start.sh',
      cwd: '/www/wwwroot/learning/polyglot-lms-v2/apps/frontend'
    }
  ]
};
  `;
  
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    cd /www/wwwroot/learning/polyglot-lms-v2/apps/frontend &&
    echo '#!/bin/bash' > start.sh &&
    echo 'export PORT=3005' >> start.sh &&
    echo 'npm run start -- -p 3005' >> start.sh &&
    chmod +x start.sh &&
    cd /www/wwwroot/learning/polyglot-lms-v2 &&
    cat << 'EOF' > ecosystem.config.js
${fileContent}
EOF
    pm2 stop all || true &&
    pm2 delete learning_frontend || true &&
    pm2 start ecosystem.config.js &&
    pm2 save &&
    echo "WAITING 8 SECONDS FOR NEXTJS TO BOOT..." &&
    sleep 8 &&
    echo "--- CURL 3005 ---" &&
    curl -s -I http://127.0.0.1:3005 | grep -iE 'x-powered-by|content-type' || echo "FAILED_CURL_3005" &&
    echo "--- LOGS ---" &&
    pm2 logs learning_frontend --lines 20 --nostream
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('next_debug.log', '');
    stream.on('close', (code) => {
      conn.end();
    })
    .on('data', data => fs.appendFileSync('next_debug.log', data.toString()))
    .stderr.on('data', data => fs.appendFileSync('next_debug.log', data.toString()));
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

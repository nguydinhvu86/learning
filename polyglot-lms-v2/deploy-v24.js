const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const ecoContent = `
module.exports = {
  apps: [
    {
      name: 'learning_backend',
      script: 'dist/src/main.js',
      cwd: '/www/wwwroot/learning/polyglot-lms-v2/apps/backend',
      interpreter: '/www/server/nvm/versions/node/v24.14.0/bin/node',
      env: { PORT: 3001, NODE_ENV: 'production' }
    },
    {
      name: 'learning_frontend',
      script: 'server.js',
      cwd: '/www/wwwroot/learning/polyglot-lms-v2/apps/frontend',
      interpreter: '/www/server/nvm/versions/node/v24.14.0/bin/node',
      env: { PORT: 3005, NODE_ENV: 'production' }
    }
  ]
};
`;

  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    
    # 1. Update Ecosystem
    cd /www/wwwroot/learning/polyglot-lms-v2 &&
    cat << 'EOF' > ecosystem.config.js
${ecoContent}
EOF

    # 2. Reboot PM2
    pm2 stop all || true &&
    pm2 delete learning_frontend || true &&
    pm2 delete learning_backend || true &&
    pm2 start ecosystem.config.js &&
    pm2 save &&
    echo "--- WAITING 6 SECONDS ---" &&
    sleep 6 &&
    
    echo "--- CHECKING NEXT.JS ---" &&
    curl -s -v http://127.0.0.1:3005 2>&1 | grep -iE 'content-type|x-powered-by' || echo "FAILED_NEXT_3005"
    
    echo "--- CHECKING NEST.JS ---" &&
    curl -s -I http://127.0.0.1:3001 | head -n 3 || echo "FAILED_NEST_3001"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('v24_boot.log', '');
    stream.on('close', (code) => {
      conn.end();
    })
    .on('data', data => fs.appendFileSync('v24_boot.log', data.toString()))
    .stderr.on('data', data => fs.appendFileSync('v24_boot.log', data.toString()));
  });

}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

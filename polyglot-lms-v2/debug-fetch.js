const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    
    echo "--- PM2 BACKEND ERRORS ---" &&
    pm2 logs learning_backend --lines 40 --nostream &&
    
    echo "--- CHECKING ENVIRONMENT ---" &&
    cd /www/wwwroot/learning/polyglot-lms-v2/apps/backend &&
    cat .env || echo "NO .ENV"
    
    echo "--- PRISMA CLIENT STATUS ---" &&
    grep "provider" prisma/schema.prisma || echo "NO SCHEMA"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('debug_fetch.log', '');
    stream.on('close', (code) => {
      conn.end();
    })
    .on('data', data => fs.appendFileSync('debug_fetch.log', data.toString()))
    .stderr.on('data', data => fs.appendFileSync('debug_fetch.log', data.toString()));
  });

}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

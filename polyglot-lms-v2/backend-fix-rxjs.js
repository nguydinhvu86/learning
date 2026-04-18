const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    
    echo "--- INSTALLING RXJS ---" &&
    cd /www/wwwroot/learning/polyglot-lms-v2/apps/backend &&
    npm install rxjs &&
    
    echo "--- REBOOTING NESTJS ---" &&
    pm2 restart learning_backend || true &&
    
    echo "--- WAITING 4 SECONDS ---" &&
    sleep 4 &&
    
    echo "--- CHECKING NEST.JS 3001 ---" &&
    curl -s -I http://127.0.0.1:3001 | head -n 12 || echo "FAILED_NEST_3001"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('backend_rxjs.log', '');
    stream.on('close', (code) => {
      conn.end();
    })
    .on('data', data => fs.appendFileSync('backend_rxjs.log', data.toString()))
    .stderr.on('data', data => fs.appendFileSync('backend_rxjs.log', data.toString()));
  });

}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

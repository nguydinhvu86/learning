const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    cd /www/wwwroot/learning/polyglot-lms-v2/apps/backend &&
    echo '#!/bin/bash' > start_backend.sh &&
    echo 'export PORT=3001' >> start_backend.sh &&
    echo 'node dist/src/main.js || node dist/main.js' >> start_backend.sh &&
    chmod +x start_backend.sh &&
    pm2 restart learning_backend &&
    pm2 save
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => process.stdout.write(data))
    .stderr.on('data', data => process.stderr.write(data));
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

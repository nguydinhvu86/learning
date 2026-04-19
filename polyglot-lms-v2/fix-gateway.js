const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    echo "=== RESTARTING NEXT.JS CLEARLY ===" &&
    pm2 delete learning_frontend || true &&
    cd /www/wwwroot/learning/polyglot-lms-v2/apps/frontend &&
    rm -rf .next/cache &&
    pm2 start start.sh --name learning_frontend &&
    pm2 save &&
    echo "=== RESTART DONE ==="
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', () => {
      console.log(out);
      conn.end();
    })
    .on('data', data => out += data.toString())
    .stderr.on('data', data => out += data.toString());
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

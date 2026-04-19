const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    echo "=== PM2 STATUS ===" &&
    pm2 status &&
    echo "\\n=== BACKEND LOGS ===" &&
    pm2 logs learning_backend --lines 30 --nostream &&
    echo "\\n=== FRONTEND LOGS ===" &&
    pm2 logs learning_frontend --lines 30 --nostream
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', () => {
      require('fs').writeFileSync('pm2_status_crash.log', out);
      console.log("FETCHED!");
      conn.end();
    })
    .on('data', data => out += data.toString())
    .stderr.on('data', data => out += data.toString());
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

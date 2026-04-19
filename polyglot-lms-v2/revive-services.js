const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    pm2 start inside.tsol.vn || pm2 start 0 &&
    pm2 start makevideo-ai || pm2 start 5 &&
    pm2 start pbx-sync || pm2 start 6 &&
    pm2 save &&
    pm2 status
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

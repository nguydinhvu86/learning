const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin
    pm2 restart all
    pm2 save
    echo "PM2 RESTARTED SUCCESSFULLY"
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    })
    .on('data', data => process.stdout.write(data.toString()))
    .stderr.on('data', data => process.stderr.write(data.toString()));
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

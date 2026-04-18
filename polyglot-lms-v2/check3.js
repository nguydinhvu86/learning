const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    pm2 logs learning_frontend --lines 40 --nostream
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('crash2.log', '');
    stream.on('close', (code) => {
      conn.end();
    })
    .on('data', data => fs.appendFileSync('crash2.log', data.toString()))
    .stderr.on('data', data => fs.appendFileSync('crash2.log', data.toString()));
  });

}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

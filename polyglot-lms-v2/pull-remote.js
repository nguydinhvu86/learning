const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "--- FRONTEND DIRECTORY CONTENTS ---"
    ls -la /www/wwwroot/learning/polyglot-lms-v2/apps/frontend || echo "NO FRONTEND"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('ls.log', '');
    stream.on('close', (code) => {
      conn.end();
    })
    .on('data', data => fs.appendFileSync('ls.log', data.toString()))
    .stderr.on('data', data => fs.appendFileSync('ls.log', data.toString()));
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "--- ROOT DIRECTORY ---"
    ls -la /www/wwwroot/learning/polyglot-lms-v2 || echo "NO ROOT"
    echo "--- APPS DIRECTORY ---"
    ls -la /www/wwwroot/learning/polyglot-lms-v2/apps || echo "NO APPS"
    echo "--- FRONTEND DIRECTORY ---"
    ls -la /www/wwwroot/learning/polyglot-lms-v2/apps/frontend || echo "NO FRONTEND"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('repo.log', '');
    stream.on('close', (code) => {
      conn.end();
    })
    .on('data', data => fs.appendFileSync('repo.log', data.toString()))
    .stderr.on('data', data => fs.appendFileSync('repo.log', data.toString()));
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

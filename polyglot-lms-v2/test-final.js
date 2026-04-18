const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "--- CHECKING BACKEND ---"
    pm2 list
    echo "--- CHECKING PUBLIC NEXT.JS PROXY ---"
    curl -v -X POST http://124.158.9.5/api/v1/auth/login -H "Host: study.tsol.vn" -H "Content-Type: application/json" -d '{"email":"student@polyglot.edu","password":"1"}' 2>&1
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', () => {
      require('fs').writeFileSync('final_check.txt', out);
      conn.end();
    })
    .on('data', data => out += data.toString())
    .stderr.on('data', data => out += data.toString());
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    netstat -tulpn | grep 3001
    curl -v -X POST http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"student@polyglot.edu","password":"1"}' 2>&1
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', () => {
      require('fs').writeFileSync('curl_output.txt', out);
      conn.end();
    })
    .on('data', data => out += data.toString())
    .stderr.on('data', data => out += data.toString());
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

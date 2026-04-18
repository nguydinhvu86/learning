const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "--- TEST 1: DIRECT LOCALHOST (NESTJS) ---"
    curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"student@polyglot.edu","password":"1"}'
    echo ""
    echo "--- TEST 2: VIA NGINX REVERSE PROXY ---"
    curl -s -o /dev/null -w "%{http_code}" -X POST http://124.158.9.5/api/v1/auth/login -H "Host: study.tsol.vn" -H "Content-Type: application/json" -d '{"email":"student@polyglot.edu","password":"1"}'
    echo ""
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => process.stdout.write(data))
    .stderr.on('data', data => process.stderr.write(data));
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

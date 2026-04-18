const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "--- TEST 3001 (NESTJS DIRECT) ---" &&
    curl -s -X POST http://127.0.0.1:3001/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"vutg@tsol.vn","password":"Tgtelecom1"}' &&
    echo "" &&
    echo "--- TEST 3000 (NEXTJS REWRITE) ---" &&
    curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"vutg@tsol.vn","password":"Tgtelecom1"}' &&
    echo "" &&
    echo "--- TEST 80 (NGINX PROXY) ---" &&
    curl -s -X POST http://localhost:80/api/v1/auth/login -H "Host: study.tsol.vn" -H "Content-Type: application/json" -d '{"email":"vutg@tsol.vn","password":"Tgtelecom1"}'
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', (code) => {
      const fs = require('fs');
      fs.writeFileSync('trace_stack.log', output);
      conn.end();
    })
    .on('data', data => { output += data.toString(); })
    .stderr.on('data', data => { output += data.toString(); });
  });

}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "--- CURL 3000 ---"
    curl -s -I http://127.0.0.1:3000 | grep -iE 'x-powered-by|content-type' || echo "Failed"
    echo "--- CURL 3005 ---"
    curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3005 || echo "Failed"
    echo "\\n--- NGINX CONF ---"
    echo "P@ssw0rdVu" | sudo -S cat /www/server/panel/vhost/nginx/study.tsol.vn.conf || echo "Not found"
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('vps.log', '');
    stream.on('close', () => conn.end())
          .on('data', data => fs.appendFileSync('vps.log', data.toString()))
          .stderr.on('data', data => fs.appendFileSync('vps.log', data.toString()));
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

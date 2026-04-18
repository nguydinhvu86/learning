const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "--- CHECKING PORT 3005 ---"
    curl -s -v http://127.0.0.1:3005 || echo "FAILED_CURL_3005"
    echo "--- PROXY REPLACEMENTS ---"
    echo "P@ssw0rdVu" | sudo -S cat /www/server/panel/vhost/nginx/study.tsol.vn.conf | grep proxy_pass || true
    echo "--- AAPANEL PROXY CONF ---"
    echo "P@ssw0rdVu" | sudo -S grep proxy_pass /www/server/panel/vhost/nginx/proxy/study.tsol.vn/*.conf || echo "NO_AAPANEL_PROXY"
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

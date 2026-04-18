const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "P@ssw0rdVu" | sudo -S ls -la /www/server/panel/vhost/nginx/proxy/study.tsol.vn/ &&
    echo "----" &&
    echo "P@ssw0rdVu" | sudo -S cat /www/server/panel/vhost/nginx/proxy/study.tsol.vn/*.conf &&
    echo "---- NGINX TEST ----" &&
    echo "P@ssw0rdVu" | sudo -S nginx -t
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('nginx_debug.log', '');
    stream.on('close', (code) => conn.end())
    .on('data', data => fs.appendFileSync('nginx_debug.log', data.toString()))
    .stderr.on('data', data => fs.appendFileSync('nginx_debug.log', data.toString()));
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

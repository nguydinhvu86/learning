const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `cat /www/server/panel/vhost/nginx/study.tsol.vn.conf`;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', () => {
      require('fs').writeFileSync('nginx_conf.txt', out);
      conn.end();
    })
    .on('data', data => out += data.toString())
    .stderr.on('data', data => out += data.toString());
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

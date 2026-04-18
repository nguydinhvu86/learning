const { Client } = require('ssh2');

const conn = new Client();
const HOST = '124.158.9.5';
const USER = 'incall';
const PASS = 'P@ssw0rdVu';

conn.on('ready', () => {
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    cd /www/wwwroot/learning/polyglot-lms-v2/apps/frontend &&
    pm2 stop learning_frontend || true &&
    pm2 delete learning_frontend || true &&
    pm2 start npm --name "learning_frontend" -- run start -- -p 3005 &&
    pm2 save &&
    echo "${PASS}" | sudo -S sed -i 's/127.0.0.1:3000/127.0.0.1:3005/g' /www/server/panel/vhost/nginx/proxy/study.tsol.vn/*.conf || true &&
    echo "${PASS}" | sudo -S nginx -s reload || true &&
    echo "FIX_APPLIED"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      console.log('Fix Final exited with code: ' + code);
      conn.end();
    })
    .on('data', data => process.stdout.write(data.toString()))
    .stderr.on('data', data => process.stderr.write(data.toString()));
  });
}).connect({ host: HOST, port: 22, username: USER, password: PASS });

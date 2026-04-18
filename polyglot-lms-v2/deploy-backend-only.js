const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    
    echo "--- PULLING FROM GIT ---" &&
    cd /www/wwwroot/learning/polyglot-lms-v2 &&
    chattr -i .user.ini >/dev/null 2>&1 || true &&
    git fetch --all &&
    git reset --hard origin/main &&
    chattr +i .user.ini >/dev/null 2>&1 || true &&
    
    echo "--- NPM INSTALL WORKSPACE ---" &&
    cd /www/wwwroot/learning/polyglot-lms-v2 &&
    npm install &&
    
    echo "--- BUILD NEST.JS ---" &&
    cd /www/wwwroot/learning/polyglot-lms-v2/apps/backend &&
    npm install &&
    npx prisma generate &&
    npm run build &&
    
    echo "--- REBOOTING PM2 BACKEND ---" &&
    pm2 restart learning_backend &&
    pm2 save &&
    echo "--- DONE ---"
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', () => {
      console.log(out);
      conn.end();
    })
    .on('data', data => out += data.toString())
    .stderr.on('data', data => out += data.toString());
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

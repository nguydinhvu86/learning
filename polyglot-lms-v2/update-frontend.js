const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    
    echo "--- PULLING GIT ---" &&
    cd /www/wwwroot/learning/polyglot-lms-v2 &&
    git fetch && git reset --hard origin/main || true &&
    
    echo "--- BUILDING FRONTEND ---" &&
    cd apps/frontend &&
    rm -rf .next || true &&
    npx next build &&
    
    echo "--- RESTARTING PM2 ---" &&
    pm2 restart learning_frontend &&
    pm2 save &&
    echo "--- WAITING 6 SECONDS ---" &&
    sleep 6 &&
    
    echo "--- CHECKING NEXT.JS 3005 ---" &&
    curl -s -v http://127.0.0.1:3005 2>&1 | grep -iE 'content-type|x-powered-by' || echo "FAILED_NEXT_3005"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('update_frontend.log', '');
    stream.on('close', (code) => {
      conn.end();
    })
    .on('data', data => fs.appendFileSync('update_frontend.log', data.toString()))
    .stderr.on('data', data => fs.appendFileSync('update_frontend.log', data.toString()));
  });

}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

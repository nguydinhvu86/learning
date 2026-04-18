const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const fileContent = `
module.exports = {
  apps: [
    {
      name: 'learning_backend',
      script: 'npm',
      args: 'run start:prod',
      cwd: '/www/wwwroot/learning/polyglot-lms-v2/apps/backend',
      env: { PORT: 3001 }
    },
    {
      name: 'learning_frontend',
      script: 'npm',
      args: 'run start',
      cwd: '/www/wwwroot/learning/polyglot-lms-v2/apps/frontend',
      env: { PORT: 3005 }
    }
  ]
};
  `;

  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    cd /www/wwwroot/learning/polyglot-lms-v2 &&
    
    echo "--- PULLING FROM GIT ---" &&
    git fetch --all &&
    git reset --hard origin/main &&
    git clean -fd &&
    
    echo "--- NPM INSTALL WORKSPACE ---" &&
    npm install &&
    
    echo "--- BUILD NEXT.JS ---" &&
    cd apps/frontend &&
    rm -rf .next || true &&
    npm run build &&
    
    echo "--- REBOOTING PM2 ---" &&
    cd /www/wwwroot/learning/polyglot-lms-v2 &&
    cat << 'EOF' > ecosystem.config.js
${fileContent}
EOF
    pm2 stop all || true &&
    pm2 delete learning_frontend || true &&
    pm2 delete learning_backend || true &&
    pm2 start ecosystem.config.js &&
    pm2 save &&
    echo "--- DONE ---"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('deploy_real.log', '');
    stream.on('close', (code) => {
      console.log('Finished with code ' + code);
      conn.end();
    })
    .on('data', data => fs.appendFileSync('deploy_real.log', data.toString()))
    .stderr.on('data', data => fs.appendFileSync('deploy_real.log', data.toString()));
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

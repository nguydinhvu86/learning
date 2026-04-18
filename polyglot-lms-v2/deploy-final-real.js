const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const fileContent = `
module.exports = {
  apps: [
    {
      name: 'learning_backend',
      script: 'start_backend.sh',
      cwd: '/www/wwwroot/learning/polyglot-lms-v2/apps/backend'
    },
    {
      name: 'learning_frontend',
      script: 'start.sh',
      cwd: '/www/wwwroot/learning/polyglot-lms-v2/apps/frontend'
    }
  ]
};
  `;

  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    
    echo "--- PULLING FROM GIT ---" &&
    cd /www/wwwroot/learning/polyglot-lms-v2 &&
    chattr -i .user.ini >/dev/null 2>&1 || true &&
    git fetch --all &&
    git reset --hard origin/main &&
    git clean -fd || true &&
    chattr +i .user.ini >/dev/null 2>&1 || true &&
    
    echo "--- NPM INSTALL WORKSPACE ---" &&
    cd /www/wwwroot/learning/polyglot-lms-v2 &&
    npm install &&
    
    echo "--- BUILD NEXT.JS ---" &&
    cd /www/wwwroot/learning/polyglot-lms-v2/apps/frontend &&
    node fix_api_urls.js &&
    rm -rf .next || true &&
    npm run build &&
    echo '#!/bin/bash' > start.sh &&
    echo 'export PORT=3005' >> start.sh &&
    echo 'npm run start -- -p 3005' >> start.sh &&
    chmod +x start.sh &&

    echo "--- BUILD NEST.JS ---" &&
    cd /www/wwwroot/learning/polyglot-lms-v2/apps/backend &&
    npx prisma generate &&
    npm run build &&
    echo '#!/bin/bash' > start_backend.sh &&
    echo 'export PORT=3001' >> start_backend.sh &&
    echo 'npm run start:prod' >> start_backend.sh &&
    chmod +x start_backend.sh &&
    
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

const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const serverJsContent = `
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = false;
const hostname = 'localhost';
const port = 3005;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log('> Ready on http://' + hostname + ':' + port);
    });
});
`;

  const ecoContent = `
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
      script: 'server.js',
      cwd: '/www/wwwroot/learning/polyglot-lms-v2/apps/frontend',
      env: { PORT: 3005, NODE_ENV: 'production' }
    }
  ]
};
`;

  const cmd = `
    export PATH=/www/server/nvm/versions/node/v24.14.0/bin:$PATH || export PATH=$PATH:/usr/local/bin &&
    
    # 1. Write the programatic Next.js boot server
    cat << 'EOF' > /www/wwwroot/learning/polyglot-lms-v2/apps/frontend/server.js
${serverJsContent}
EOF

    # 2. Fix the Backend Package.json that Git Reset destroyed
    cd /www/wwwroot/learning/polyglot-lms-v2/apps/backend &&
    sed -i 's/"node dist\\/main"/"node dist\\/src\\/main"/g' package.json || true
    
    # 3. Create the PM2 Ecosystem
    cd /www/wwwroot/learning/polyglot-lms-v2 &&
    cat << 'EOF' > ecosystem.config.js
${ecoContent}
EOF

    # 4. Reboot PM2
    pm2 stop all || true &&
    pm2 delete learning_frontend || true &&
    pm2 delete learning_backend || true &&
    pm2 start ecosystem.config.js &&
    pm2 save &&
    echo "--- WAITING 6 SECONDS ---" &&
    sleep 6 &&
    
    echo "--- CHECKING NEXT.JS ---" &&
    curl -s -I http://127.0.0.1:3005 | grep -iE 'x-powered-by|content-type' || echo "FAILED_NEXT_3005"
    
    echo "--- CHECKING NEST.JS ---" &&
    curl -s -I http://127.0.0.1:3001 | head -n 3 || echo "FAILED_NEST_3001"
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    const fs = require('fs');
    fs.writeFileSync('ultimate.log', '');
    stream.on('close', (code) => {
      conn.end();
    })
    .on('data', data => fs.appendFileSync('ultimate.log', data.toString()))
    .stderr.on('data', data => fs.appendFileSync('ultimate.log', data.toString()));
  });

}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `cat /www/wwwroot/learning/polyglot-lms-v2/apps/frontend/next.config.mjs`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let output = '';
    stream.on('close', (code) => {
      const fs = require('fs');
      fs.writeFileSync('next_config_check.log', output);
      conn.end();
    })
    .on('data', data => { output += data.toString(); })
    .stderr.on('data', data => { output += data.toString(); });
  });

}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

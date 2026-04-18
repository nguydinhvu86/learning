const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    cd /www/wwwroot/learning/polyglot-lms-v2
    echo "--- GIT STATUS ---" > git_out.txt
    git status >> git_out.txt
    echo "--- GIT LOG ---" >> git_out.txt
    git log -n 5 --oneline >> git_out.txt
    echo "--- GIT REFLOG ---" >> git_out.txt
    git reflog -n 10 >> git_out.txt
    cat git_out.txt
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', () => {
      require('fs').writeFileSync('remote_git.txt', out);
      conn.end();
    })
    .on('data', data => out += data.toString())
    .stderr.on('data', data => out += data.toString());
  });
}).connect({ host: '124.158.9.5', port: 22, username: 'incall', password: 'P@ssw0rdVu' });

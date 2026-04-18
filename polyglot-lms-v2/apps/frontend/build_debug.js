const { execSync } = require('child_process');
const fs = require('fs');
try {
  const out = execSync('npm run build', { stdio: 'pipe' });
  fs.writeFileSync('build_output.txt', out.toString());
} catch (e) {
  fs.writeFileSync('build_error.txt', (e.stdout ? e.stdout.toString() : '') + '\n' + (e.stderr ? e.stderr.toString() : ''));
}

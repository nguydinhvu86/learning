const { execSync } = require('child_process');
const fs = require('fs');
try {
  const out = execSync('node prisma/seed.ts', { stdio: 'pipe' });
  fs.writeFileSync('seed_output.txt', out.toString());
} catch (e) {
  fs.writeFileSync('seed_error.txt', e.stderr ? e.stderr.toString() : e.toString());
}

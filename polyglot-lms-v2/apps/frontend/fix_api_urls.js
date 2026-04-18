const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    f = dir + '/' + file;
    const stat = fs.statSync(f);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(f));
    } else { 
      if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.js')) {
        results.push(f);
      }
    }
  });
  return results;
}

const frontendDir = path.join(__dirname, 'app');
const componentsDir = path.join(__dirname, 'components');
const files = [...walk(frontendDir)];
if (fs.existsSync(componentsDir)) {
  files.push(...walk(componentsDir));
}

let modifiedFiles = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace API calls: `http://${window.location.hostname}:3001/api/...` -> `/api/...`
  // Also handle single or double quotes if string concatenation was used.
  content = content.replace(/['"`]http:\/\/\$\{window\.location\.hostname\}:3001(\/api\/.*?)['"`]/g, '`$1`');
  
  // Replace Socket.io calls: `http://${window.location.hostname}:3001` -> `/`
  // Because NGINX maps / to Next.js and frontend might need socket proxy, or maybe Nginx needs /socket.io/ mapped!
  content = content.replace(/['"`]http:\/\/\$\{window\.location\.hostname\}:3001['"`]/g, '`http://${window.location.hostname}:3001`'); // Reverting socket to hostname for now or change it later? Let's make socket relative too by leaving it empty, socket.io defaults to window.location
  content = content.replace(/io\([^,]+,/g, "io({"); // simplified fallback if needed, but let's be more precise
  
  // Specifically target the NotificationBell socket
  content = content.replace(/io\(['"`]http:\/\/\$\{window\.location\.hostname\}:3001['"`]/g, "io('', { path: '/socket.io'");

  if (content !== original) {
    fs.writeFileSync(f, content);
    console.log('Sanitized:', f);
    modifiedFiles++;
  }
});

console.log(`Sanitization complete. Fixed ${modifiedFiles} files.`);

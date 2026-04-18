const fs = require('fs');
['polyglot-lms-v2/apps/frontend/app/page.tsx', 'polyglot-lms-v2/apps/frontend/app/student/dashboard/page.tsx'].forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  text = text.replace(/cyan/g, 'emerald').replace(/blue/g, 'teal').replace(/indigo/g, 'green');
  fs.writeFileSync(f, text);
});
console.log('Colors replaced');

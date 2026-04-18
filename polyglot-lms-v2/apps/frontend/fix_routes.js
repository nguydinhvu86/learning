const fs = require('fs');

function copyAndClean(src, dest) {
  try {
    if (fs.existsSync(src)) {
      console.log('Copying', src, 'to', dest);
      fs.cpSync(src, dest, { recursive: true });
      console.log('Deleting', src);
      fs.rmSync(src, { recursive: true, force: true });
    }
  } catch (e) {
    console.error('Error on', src, e.message);
    try {
      // If folder is locked, just rename the page.tsx inside to stop Next.js collision
      fs.renameSync(src + '/dashboard/page.tsx', src + '/dashboard/page_lock.tsx');
    } catch(err) {}
  }
}

copyAndClean('app/(admin)', 'app/admin');
copyAndClean('app/(student)', 'app/student');
copyAndClean('app/(teacher)', 'app/teacher');

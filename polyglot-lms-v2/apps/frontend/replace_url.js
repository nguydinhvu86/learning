const fs = require('fs');
const files = [
  "app/teacher/dashboard/page.tsx",
  "app/teacher/classes/[classId]/page.tsx",
  "app/student/placement/page.tsx",
  "app/student/dashboard/page.tsx",
  "app/student/course/[courseId]/page.tsx",
  "app/student/course/[courseId]/lesson/[lessonId]/page.tsx",
  "app/components/NotificationBell.tsx",
  "app/(auth)/login/page.tsx",
  "app/admin/lesson-builder/[lessonId]/page.tsx",
  "app/admin/dashboard/page.tsx",
  "app/admin/course-builder/[courseId]/page.tsx"
];

files.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/['"`]http:\/\/localhost:(300[01])(.*?)['"`]/g, '`http://${window.location.hostname}:$1$2`');
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error with', f, err);
    }
  }
});
console.log('Done replacement');

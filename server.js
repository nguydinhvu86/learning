const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const pool = mysql.createPool({
  host: '192.168.10.40',
  user: 'root1',
  password: '',
  database: 'polyglot_lms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ==========================================
// ADMIN CURRICULUM ENDPOINTS (PHASE 8)
// ==========================================

// Courses
app.get('/api/admin/courses', async (req, res) => {
   try {
     const [rows] = await pool.query('SELECT * FROM courses');
     res.json(rows);
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/admin/courses', async (req, res) => {
   const { title, description, language_target } = req.body;
   try {
     await pool.query('INSERT INTO courses (title, description, language_target) VALUES (?,?,?)', [title, description, language_target]);
     res.json({success: true});
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/admin/courses/delete', async (req, res) => {
   try {
     await pool.query('DELETE FROM courses WHERE id=?', [req.body.id]);
     res.json({success: true});
   } catch(e) { res.status(500).json({error: e.message}); }
});

// Lessons
app.get('/api/admin/lessons/:courseId', async (req, res) => {
   try {
     const [rows] = await pool.query('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index', [req.params.courseId]);
     res.json(rows);
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/admin/lessons', async (req, res) => {
   const { course_id, title, order_index } = req.body;
   try {
     await pool.query('INSERT INTO lessons (course_id, title, order_index) VALUES (?,?,?)', [course_id, title, order_index]);
     res.json({success: true});
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/admin/lessons/delete', async (req, res) => {
   try {
     await pool.query('DELETE FROM lessons WHERE id=?', [req.body.id]);
     res.json({success: true});
   } catch(e) { res.status(500).json({error: e.message}); }
});

// Items (Vocab, Grammar, Sentences)
app.get('/api/admin/items/:lessonId', async (req, res) => {
   try {
     const [rows] = await pool.query('SELECT * FROM items WHERE lesson_id = ?', [req.params.lessonId]);
     res.json(rows);
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/admin/items', async (req, res) => {
   const { lesson_id, item_type, target_text, phonetic, native_meaning } = req.body;
   try {
     await pool.query('INSERT INTO items (lesson_id, item_type, target_text, phonetic, native_meaning) VALUES (?,?,?,?,?)', 
       [lesson_id, item_type, target_text, phonetic, native_meaning]);
     res.json({success: true});
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/admin/items/delete', async (req, res) => {
   try {
     await pool.query('DELETE FROM items WHERE id=?', [req.body.id]);
     res.json({success: true});
   } catch(e) { res.status(500).json({error: e.message}); }
});

// ==========================================
// ADMIN USER & PROGRESS ENDPOINTS
// ==========================================
app.get('/api/admin/users', async (req, res) => {
   try {
     const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
     res.json(rows);
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/admin/users', async (req, res) => {
   const { username, role } = req.body;
   try {
     const id = uuidv4();
     await pool.query('INSERT INTO users (id, username, role) VALUES (?,?,?)', [id, username, role || 'student']);
     res.json({success: true, id});
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/admin/users/delete', async (req, res) => {
   try {
     await pool.query('DELETE FROM users WHERE id=?', [req.body.id]);
     res.json({success: true});
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/admin/progress/:userId', async (req, res) => {
   try {
     // Using vocab_id from learning_progress to join with items table logic
     const [rows] = await pool.query(`
        SELECT lp.*, i.target_text, i.item_type, l.title as lesson_title, c.title as course_title
        FROM learning_progress lp
        JOIN items i ON lp.vocab_id = i.id
        JOIN lessons l ON i.lesson_id = l.id
        JOIN courses c ON l.course_id = c.id
        WHERE lp.user_id = ?
        ORDER BY lp.next_review DESC
     `, [req.params.userId]);
     res.json(rows);
   } catch(e) { res.status(500).json({error: e.message}); }
});

// ==========================================
// STUDENT ENDPOINTS (PHASE 8)
// ==========================================
app.get('/api/student/roadmap', async (req, res) => {
   try {
     // Fetch hierarchical data: Courses -> Lessons
     const [courses] = await pool.query('SELECT * FROM courses');
     for (let c of courses) {
       const [lessons] = await pool.query('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index', [c.id]);
       c.lessons = lessons;
     }
     res.json(courses);
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/practice/:lessonId', async (req, res) => {
   try {
     const [items] = await pool.query('SELECT * FROM items WHERE lesson_id = ?', [req.params.lessonId]);
     res.json(items);
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/users/auth', async (req, res) => {
   const { username } = req.body;
   try {
     const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
     if (rows.length > 0) {
        res.json(rows[0]);
     } else {
        const id = uuidv4();
        await pool.query('INSERT INTO users (id, username, role) VALUES (?,?,?)', [id, username, 'student']);
        res.json({id, username, role: 'student'});
     }
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/student/progress', async (req, res) => {
   const { user_id, item_id, interval_days, ease, next_review } = req.body;
   try {
     await pool.query(`
       INSERT INTO learning_progress (user_id, vocab_id, interval_days, ease, next_review)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE interval_days=VALUES(interval_days), ease=VALUES(ease), next_review=VALUES(next_review)
     `, [user_id, item_id, interval_days || 0, ease || 2.5, next_review || Date.now()]);
     res.json({success: true});
   } catch(e) { res.status(500).json({error: e.message}); }
});

app.get('/api/student/progress/:userId', async (req, res) => {
   try {
     const [rows] = await pool.query('SELECT vocab_id as item_id, interval_days, ease, next_review FROM learning_progress WHERE user_id = ?', [req.params.userId]);
     res.json(rows);
   } catch(e) { res.status(500).json({error: e.message}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Linguistic Expert API (MySQL) Running on port', PORT);
});

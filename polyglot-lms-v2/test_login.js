fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'student@polyglot.edu', password: 'password123' })
}).then(res => res.text().then(text => console.log('HTTP', res.status, text)))
  .catch(err => console.error('FETCH ERROR:', err.message));

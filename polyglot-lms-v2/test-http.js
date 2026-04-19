const http = require('http');

const data = JSON.stringify({ seq_no: 888 });

const options = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/v1/admin/blocks/05287b0d-b541-47a3-b54b-d72b22ceae7c', // From previous DB dump
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log('statusCode:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();

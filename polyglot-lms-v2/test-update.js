const axios = require('axios');
async function test() {
  try {
    const res = await axios.put('http://127.0.0.1:3001/v1/admin/blocks/1a7441ad-2e50-4d57-b08e-152e98c760fb', {
       seq_no: 99
    });
    console.log("RESPONSE:", res.status, res.data);
  } catch (e) {
    console.log("ERROR:", e.message, e.response?.data);
  }
}
test();

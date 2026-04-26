const fs = require('fs');
fs.writeFileSync('test.pdf', 'test pdf content');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function test() {
  const form = new FormData();
  form.append('file', fs.createReadStream('test.pdf'));
  
  // We don't have auth token here but let's see what cloudinary says if we bypass auth or if we just test cloudinary directly
}
test();

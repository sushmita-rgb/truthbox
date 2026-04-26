require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function test() {
  try {
    const fs = require('fs');
    fs.writeFileSync('test.pdf', 'test pdf content');
    console.log("Uploading...");
    const res = await cloudinary.uploader.upload('test.pdf', {
      resource_type: "auto",
      folder: "Verit/feedback"
    });
    console.log("SUCCESS:", res);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
test();

const axios = require("axios");

async function testSendOtp() {
  try {
    console.log("Sending request to /api/auth/send-otp...");
    const res = await axios.post("http://localhost:5000/api/auth/send-otp", {
      email: "test-" + Date.now() + "@example.com"
    });
    console.log("✅ Success:", res.data);
  } catch (err) {
    console.error("❌ Failed:", err.response ? err.response.data : err.message);
  }
}

testSendOtp();

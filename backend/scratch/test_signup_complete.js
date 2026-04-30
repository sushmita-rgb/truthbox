const axios = require("axios");

async function testSignupComplete() {
  const email = "test-signup-1777464846738@example.com";
  const otp = "910336";
  const username = "testuser" + Date.now();
  const password = "Password123!";
  
  try {
    console.log(`Step 2: Completing signup for ${username}...`);
    const res = await axios.post("http://localhost:5000/api/auth/signup", {
      username,
      email,
      password,
      otp
    });
    console.log("✅ Signup Succeeded:", res.data.message);
    console.log("User data:", res.data.user);
  } catch (err) {
    console.error("❌ Failed:", err.response ? err.response.data : err.message);
  }
}

testSignupComplete();

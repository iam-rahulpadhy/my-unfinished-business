const API = "https://my-unfinished-business.onrender.com/api";
const fs = require('fs');

async function test() {
  console.log("Logging in...");
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "testuser39076", password: "password123" })
  });
  
  if (!loginRes.ok) {
    console.error("Login failed", await loginRes.text());
    return;
  }
  
  const data = await loginRes.json();
  const token = data.token;
  console.log("Got token");

  // Create a 1MB dummy image
  const buffer = Buffer.alloc(1024 * 1024, 'a');
  
  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: 'image/jpeg' }), 'dummy.jpg');

  console.log("Uploading avatar...");
  const uploadRes = await fetch(`${API}/users/me/avatar`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  });

  console.log("Upload Status:", uploadRes.status);
  console.log("Upload Body:", await uploadRes.text());
}

test().catch(console.error);

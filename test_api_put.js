const API = "https://my-unfinished-business.onrender.com/api";

async function test() {
  console.log("Logging in...");
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "rahulpadhy", password: "password" })
  });
  
  if (!loginRes.ok) {
    console.error("Login failed", await loginRes.text());
    return;
  }
  
  const data = await loginRes.json();
  const token = data.token;
  console.log("Got token.");

  console.log("Testing PUT profile...");
  const putRes = await fetch(`${API}/auth/profile`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ customDisciplines: "Test 1, Test 2" })
  });

  console.log("Profile Status:", putRes.status);
  console.log("Profile Body:", await putRes.text());
}

test().catch(console.error);

const API = "https://my-unfinished-business.onrender.com/api";

async function test() {
  console.log("Logging in...");
  const loginRes = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "rahul", password: "password" })
  });
  
  if (!loginRes.ok) {
    console.error("Login failed", await loginRes.text());
    return;
  }
  
  const data = await loginRes.json();
  const token = data.token;
  console.log("Got token.");

  console.log("Posting milestone...");
  const msRes = await fetch(`${API}/milestones`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title: "Test Node", targetDate: "2026-12-31", isCompleted: false })
  });

  console.log("Milestone Status:", msRes.status);
  console.log("Milestone Body:", await msRes.text());
}

test().catch(console.error);

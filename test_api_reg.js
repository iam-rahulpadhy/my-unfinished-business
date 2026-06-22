const API = "https://my-unfinished-business.onrender.com/api";

async function test() {
  console.log("Registering test user...");
  const rnd = Math.floor(Math.random() * 100000);
  const user = {
    username: `testuser${rnd}`,
    email: `test${rnd}@example.com`,
    password: "password123",
    displayName: "Test User"
  };

  let res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user)
  });
  
  if (!res.ok) {
    console.error("Register failed", await res.text());
    return;
  }
  
  const data = await res.json();
  const token = data.token;
  console.log("Got token for", user.username);

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

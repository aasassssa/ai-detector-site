let currentUser = localStorage.getItem("email");

function login() {
  fetch("/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
  .then(r => r.json())
  .then(d => {
    if (!d.success) return alert("Login failed");
    localStorage.setItem("email", email.value);
    if (d.admin) location.href = "admin.html";
    else location.href = "index.html";
  });
}

function signup() {
  fetch("/signup", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  }).then(() => alert("Account created"));
}

function detect() {
  fetch("/detect", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      text: text.value,
      email: currentUser
    })
  })
  .then(r => r.json())
  .then(d => {
    result.innerText = `Final: ${d.final} (AI ${d.aiScore}%)`;
  });
}

if (location.pathname.includes("admin")) {
  fetch("/submissions")
    .then(r => r.json())
    .then(subs => {
      list.innerHTML = subs.map(s => `
        <div>
          <p>${s.email} → ${s.final}</p>
          <button onclick="override(${s.id}, 'AI')">Force AI</button>
          <button onclick="override(${s.id}, 'Human')">Force Human</button>
        </div>
      `).join("");
    });
}

function override(id, final) {
  fetch("/override", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ id, final })
  }).then(() => location.reload());
}
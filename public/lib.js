const apiBase = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  return JSON.parse(localStorage.getItem("user") || "null");
}

function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${apiBase}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

function requireAuthPage() {
  if (!getToken() || !getUser()) {
    window.location.href = "/login.html";
  }
}

function requireGuestPage() {
  if (getToken() && getUser()) {
    window.location.href = "/dashboard.html";
  }
}

function setMessage(el, text, isError = false) {
  el.textContent = text;
  el.className = `message ${isError ? "error" : "success"}`;
}

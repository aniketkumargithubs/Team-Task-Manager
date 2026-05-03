requireGuestPage();

const form = document.getElementById("login-form");
const message = document.getElementById("message");

if (new URLSearchParams(window.location.search).get("registered") === "1") {
  setMessage(message, "Signup successful. Please login.");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setSession(data.token, data.user);
    window.location.href = "/dashboard.html";
  } catch (err) {
    setMessage(message, err.message, true);
  }
});

requireGuestPage();

const form = document.getElementById("signup-form");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  try {
    await api("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    window.location.href = "/login.html?registered=1";
  } catch (err) {
    setMessage(message, err.message, true);
  }
});

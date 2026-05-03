requireAuthPage();

const user = getUser();
const msg = document.getElementById("message");
const userTitle = document.getElementById("user-title");
const projectsEl = document.getElementById("projects-list");
const searchTextEl = document.getElementById("search-text");
const filterStatusEl = document.getElementById("filter-status");
const filterPriorityEl = document.getElementById("filter-priority");
const searchResultsEl = document.getElementById("search-results");
let dashboardTasks = [];

userTitle.textContent = `${user.name} (${user.systemRole})`;

document.getElementById("goto-signup").addEventListener("click", () => {
  window.location.href = "/signup.html";
});

document.getElementById("logout").addEventListener("click", () => {
  clearSession();
  window.location.href = "/login.html";
});

document.getElementById("project-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  try {
    await api("/projects", { method: "POST", body: JSON.stringify(payload) });
    e.target.reset();
    setMessage(msg, "Project created.");
    await loadProjects();
  } catch (err) {
    setMessage(msg, err.message, true);
  }
});

async function loadDashboard() {
  const data = await api("/dashboard");
  dashboardTasks = data.tasks;
  document.getElementById("m-total").textContent = data.totalTasks;
  document.getElementById("m-progress").textContent = data.statusSummary["In Progress"];
  document.getElementById("m-overdue").textContent = data.overdueCount;
  document.getElementById("m-high").textContent = data.prioritySummary.High;
  document.getElementById("m-medium").textContent = data.prioritySummary.Medium;
  document.getElementById("m-low").textContent = data.prioritySummary.Low;
  renderSearchResults();
}

async function loadProjects() {
  const projects = await api("/projects");
  projectsEl.innerHTML = "";

  if (!projects.length) {
    projectsEl.innerHTML = `<p class="muted">No projects yet. Create your first project.</p>`;
    return;
  }

  projects.forEach((project) => {
    const taskCount = Array.isArray(project.tasks) ? project.tasks.length : 0;
    const doneCount = Array.isArray(project.tasks)
      ? project.tasks.filter((t) => t.status === "Done").length
      : 0;
    const progress = taskCount ? Math.round((doneCount / taskCount) * 100) : 0;
    const div = document.createElement("div");
    div.className = "project-item";
    div.innerHTML = `
      <h3>${project.name}</h3>
      <p class="muted">${project.description || "No description"}</p>
      <p class="muted">Progress: ${progress}% (${doneCount}/${taskCount} tasks done)</p>
      <button data-open="${project.id}">Open Project</button>
    `;
    projectsEl.appendChild(div);
  });

  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = `/project.html?id=${btn.dataset.open}`;
    });
  });
}

function renderSearchResults() {
  const text = searchTextEl.value.trim().toLowerCase();
  const status = filterStatusEl.value;
  const priority = filterPriorityEl.value;

  const filtered = dashboardTasks.filter((task) => {
    const textMatch =
      !text ||
      task.title.toLowerCase().includes(text) ||
      (task.description || "").toLowerCase().includes(text);
    const statusMatch = !status || task.status === status;
    const priorityMatch = !priority || task.priority === priority;
    return textMatch && statusMatch && priorityMatch;
  });

  if (!filtered.length) {
    searchResultsEl.innerHTML = `<p class="muted">No tasks matched your filters.</p>`;
    return;
  }

  searchResultsEl.innerHTML = filtered
    .slice(0, 12)
    .map(
      (task) => `
      <div class="task-item">
        <strong>${task.title}</strong>
        <span class="pill ${String(task.priority || "Medium").toLowerCase()}">${task.priority || "Medium"}</span>
        <div class="muted">${task.project?.name || "No project"} | ${task.status}</div>
      </div>
    `
    )
    .join("");
}

searchTextEl.addEventListener("input", renderSearchResults);
filterStatusEl.addEventListener("change", renderSearchResults);
filterPriorityEl.addEventListener("change", renderSearchResults);

async function init() {
  try {
    await loadDashboard();
    await loadProjects();
  } catch (err) {
    setMessage(msg, err.message, true);
  }
}

init();

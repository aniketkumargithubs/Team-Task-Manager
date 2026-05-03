requireAuthPage();

const query = new URLSearchParams(window.location.search);
const projectId = Number(query.get("id"));
if (!projectId) {
  window.location.href = "/dashboard.html";
}

const msg = document.getElementById("message");
const membersEl = document.getElementById("members-list");
const tasksEl = document.getElementById("tasks-list");
const assigneeSelect = document.getElementById("assigneeId");

document.getElementById("logout").addEventListener("click", () => {
  clearSession();
  window.location.href = "/login.html";
});

document.getElementById("back").addEventListener("click", () => {
  window.location.href = "/dashboard.html";
});

document.getElementById("member-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  try {
    const user = await api(`/users/lookup?email=${encodeURIComponent(payload.email)}`);
    await api(`/projects/${projectId}/members`, {
      method: "POST",
      body: JSON.stringify({ userId: user.id, role: payload.role }),
    });
    setMessage(msg, "Member added successfully.");
    e.target.reset();
    await loadProject();
  } catch (err) {
    setMessage(msg, err.message, true);
  }
});

document.getElementById("task-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(e.target).entries());
  payload.assigneeId = payload.assigneeId ? Number(payload.assigneeId) : null;
  payload.dueDate = payload.dueDate ? new Date(payload.dueDate).toISOString() : null;
  try {
    await api(`/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setMessage(msg, "Task created.");
    e.target.reset();
    await loadProject();
  } catch (err) {
    setMessage(msg, err.message, true);
  }
});

async function updateTaskStatus(taskId, status) {
  try {
    await api(`/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await loadProject();
  } catch (err) {
    setMessage(msg, err.message, true);
  }
}

function renderKanban(tasks) {
  const todo = document.getElementById("col-todo");
  const progress = document.getElementById("col-progress");
  const done = document.getElementById("col-done");
  todo.innerHTML = "";
  progress.innerHTML = "";
  done.innerHTML = "";

  const pushCard = (el, task) => {
    const priority = task.priority || "Medium";
    const div = document.createElement("div");
    div.className = "mini-task";
    div.innerHTML = `<strong>${task.title}</strong><br /><span class="pill ${priority.toLowerCase()}">${priority}</span>`;
    el.appendChild(div);
  };

  tasks.forEach((task) => {
    if (task.status === "Todo") pushCard(todo, task);
    else if (task.status === "In Progress") pushCard(progress, task);
    else pushCard(done, task);
  });
}

async function loadProject() {
  const project = await api(`/projects/${projectId}`);
  document.getElementById("project-title").textContent = project.name;

  membersEl.innerHTML = project.members
    .map((m) => `<div class="task-item">${m.name} (${m.email}) - ${m.ProjectMember.role}</div>`)
    .join("");
  if (!project.members.length) membersEl.innerHTML = `<p class="muted">No members.</p>`;

  assigneeSelect.innerHTML = `<option value="">Unassigned</option>`;
  project.members.forEach((member) => {
    const opt = document.createElement("option");
    opt.value = member.id;
    opt.textContent = member.name;
    assigneeSelect.appendChild(opt);
  });

  tasksEl.innerHTML = project.tasks
    .map((t) => {
      const priority = t.priority || "Medium";
      return `
      <div class="task-item">
        <strong>${t.title}</strong><br />
        <span class="muted">${t.description || "No description"}</span><br />
        <span class="pill ${priority.toLowerCase()}">${priority}</span><br />
        <span>Status: ${t.status} | Assignee: ${t.assignee ? t.assignee.name : "Unassigned"} | Due: ${
          t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "N/A"
        }</span>
        <div class="row" style="margin-top:8px">
          <button data-status="${t.id}|Todo" class="btn-secondary">Todo</button>
          <button data-status="${t.id}|In Progress" class="btn-secondary">In Progress</button>
          <button data-status="${t.id}|Done" class="btn-secondary">Done</button>
        </div>
      </div>
    `;
    })
    .join("");
  if (!project.tasks.length) tasksEl.innerHTML = `<p class="muted">No tasks yet.</p>`;
  renderKanban(project.tasks);

  document.querySelectorAll("[data-status]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const [taskId, status] = btn.dataset.status.split("|");
      updateTaskStatus(Number(taskId), status);
    });
  });
}

loadProject().catch((err) => setMessage(msg, err.message, true));

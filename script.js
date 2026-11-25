
const API = "/api";
const $ = (selector) => document.querySelector(selector);

const loginView = $("#loginView");
const dashboardView = $("#dashboardView");
const loginForm = $("#loginForm");
const loginMessage = $("#loginMessage");
const connectionStatus = $("#connectionStatus");
const logoutButton = $("#logoutButton");
const botsList = $("#botsList");
const addBotDialog = $("#addBotDialog");
const addBotForm = $("#addBotForm");
const addBotMessage = $("#addBotMessage");

let adminKey = sessionStorage.getItem("gb_admin_key") || "";

function setConnection(online) {
  connectionStatus.textContent = online ? "Online" : "Offline";
  connectionStatus.className = `status-pill ${
    online ? "status-online" : "status-offline"
  }`;
}

function showDashboard(show) {
  loginView.classList.toggle("hidden", show);
  dashboardView.classList.toggle("hidden", !show);
  logoutButton.classList.toggle("hidden", !show);
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    logout();
    throw new Error(data.error || "Chave administrativa inválida.");
  }

  if (!response.ok) {
    throw new Error(data.error || "Não foi possível concluir a operação.");
  }

  return data;
}

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");

  window.setTimeout(() => {
    el.classList.remove("show");
  }, 2800);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

async function loadBots() {
  try {
    const bots = await apiFetch("/bots");

    setConnection(true);

    const active = bots.filter(bot => bot.status === "active").length;
    const paused = bots.filter(bot => bot.status === "paused").length;

    $("#activeCount").textContent = active;
    $("#pausedCount").textContent = paused;
    $("#totalCount").textContent = bots.length;

    if (!bots.length) {
      botsList.innerHTML = `
        <div class="empty-state">
          Nenhum bot cadastrado ainda.
          Clique em “Adicionar bot” para começar.
        </div>
      `;
      return;
    }

    botsList.innerHTML = bots.map(bot => {
      const isActive = bot.status === "active";

      return `
        <article class="bot-card">
          <div class="bot-info">
            <h3>${escapeHtml(bot.username || "Bot sem nome")}</h3>

            <p class="bot-id">
              ID: ${escapeHtml(bot.id)}
            </p>

            <span class="bot-state ${isActive ? "active" : "paused"}">
              ${isActive ? "Ativo" : "Pausado"}
            </span>
          </div>

          <div class="bot-actions">
            <button
              class="icon-button"
              type="button"
              title="${isActive ? "Pausar" : "Ativar"}"
              aria-label="${isActive ? "Pausar" : "Ativar"}"
              data-action="toggle"
              data-id="${escapeHtml(bot.id)}"
            >
              ${isActive ? "Ⅱ" : "▶"}
            </button>

            <button
              class="icon-button danger"
              type="button"
              title="Excluir"
              aria-label="Excluir"
              data-action="delete"
              data-id="${escapeHtml(bot.id)}"
            >
              🗑
            </button>
          </div>
        </article>
      `;
    }).join("");

  } catch (error) {
    setConnection(false);

    botsList.innerHTML = `
      <div class="empty-state">
        ${escapeHtml(error.message)}
      </div>
    `;

    throw error;
  }
}

function logout() {
  adminKey = "";
  sessionStorage.removeItem("gb_admin_key");

  showDashboard(false);
  setConnection(false);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  adminKey = $("#adminKey").value.trim();
  loginMessage.textContent = "Verificando acesso...";

  try {
    await loadBots();

    sessionStorage.setItem("gb_admin_key", adminKey);

    loginMessage.textContent = "";
    showDashboard(true);

  } catch (error) {
    adminKey = "";
    loginMessage.textContent = error.message;
  }
});

logoutButton.addEventListener("click", logout);

$("#openAddBot").addEventListener("click", () => {
  addBotMessage.textContent = "";
  $("#botToken").value = "";
  addBotDialog.showModal();
});

$("#closeAddBot").addEventListener("click", () => {
  addBotDialog.close();
});

$("#cancelAddBot").addEventListener("click", () => {
  addBotDialog.close();
});

addBotForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = $("#botToken").value.trim();

  const submit = addBotForm.querySelector(
    'button[type="submit"]'
  );

  submit.disabled = true;
  submit.textContent = "Cadastrando...";
  addBotMessage.textContent = "";

  try {
    await apiFetch("/bots", {
      method: "POST",
      body: JSON.stringify({ token })
    });

    addBotDialog.close();

    toast("Bot cadastrado com sucesso!");

    await loadBots();

  } catch (error) {
    addBotMessage.textContent = error.message;

  } finally {
    submit.disabled = false;
    submit.textContent = "Cadastrar bot";
  }
});

botsList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const { action, id } = button.dataset;

  try {
    if (action === "toggle") {
      const card = button.closest(".bot-card");

      const currentlyActive = card
        .querySelector(".bot-state")
        .classList.contains("active");

      await apiFetch(`/bots/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: currentlyActive ? "paused" : "active"
        })
      });

      toast(
        currentlyActive ? "Bot pausado." : "Bot ativado."
      );

    } else if (action === "delete") {
      if (!window.confirm(
        "Tem certeza que deseja excluir este bot?"
      )) {
        return;
      }

      await apiFetch(
        `/bots/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      toast("Bot removido.");
    }

    await loadBots();

  } catch (error) {
    toast(error.message);
  }
});

async function restoreSession() {
  if (!adminKey) return;

  try {
    await loadBots();
    showDashboard(true);

  } catch {
    logout();
  }
}

restoreSession();

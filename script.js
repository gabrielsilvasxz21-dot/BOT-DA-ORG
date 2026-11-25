
const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");

const loginForm = document.getElementById("loginForm");
const adminKeyInput = document.getElementById("adminKey");
const loginMessage = document.getElementById("loginMessage");

const logoutButton = document.getElementById("logoutButton");
const connectionStatus = document.getElementById("connectionStatus");

const botsList = document.getElementById("botsList");

const activeCount = document.getElementById("activeCount");
const pausedCount = document.getElementById("pausedCount");
const totalCount = document.getElementById("totalCount");

const addBotDialog = document.getElementById("addBotDialog");
const addBotForm = document.getElementById("addBotForm");
const botTokenInput = document.getElementById("botToken");
const addBotMessage = document.getElementById("addBotMessage");

const openAddBot = document.getElementById("openAddBot");
const closeAddBot = document.getElementById("closeAddBot");
const cancelAddBot = document.getElementById("cancelAddBot");

const toast = document.getElementById("toast");

let adminKey = sessionStorage.getItem("gb_admin_key") || "";
let bots = [];

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "x-admin-key": adminKey
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Erro na comunicação com o servidor.");
  }

  return data;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function setConnection(online) {
  connectionStatus.textContent = online ? "Online" : "Offline";

  connectionStatus.classList.toggle("status-online", online);
  connectionStatus.classList.toggle("status-offline", !online);
}

function showLogin() {
  loginView.classList.remove("hidden");
  dashboardView.classList.add("hidden");
  logoutButton.classList.add("hidden");
  setConnection(false);
}

function showDashboard() {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  logoutButton.classList.remove("hidden");
  setConnection(true);
}

async function login(key) {
  try {
    adminKey = key;

    await api("/api/bots");

    sessionStorage.setItem("gb_admin_key", key);

    loginMessage.textContent = "";

    showDashboard();

    await loadBots();

    return true;

  } catch (error) {
    adminKey = "";

    loginMessage.textContent =
      "Senha incorreta ou erro de conexão com o servidor.";

    setConnection(false);

    return false;
  }
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  const key = adminKeyInput.value.trim();

  if (!key) {
    loginMessage.textContent = "Digite sua chave administrativa.";
    return;
  }

  const button = loginForm.querySelector('button[type="submit"]');

  button.disabled = true;
  button.textContent = "Verificando...";

  await login(key);

  button.disabled = false;
  button.textContent = "Entrar no painel";

  if (!adminKey) {
    adminKeyInput.value = "";
  }
});

logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem("gb_admin_key");

  adminKey = "";
  bots = [];

  showLogin();

  adminKeyInput.value = "";

  showToast("Você saiu do painel.");
});

async function loadBots() {
  try {
    bots = await api("/api/bots");

    renderBots();

    setConnection(true);

  } catch (error) {
    showToast(error.message);

    if (error.message.includes("Acesso administrativo")) {
      sessionStorage.removeItem("gb_admin_key");
      adminKey = "";
      showLogin();
    }
  }
}

function renderBots() {
  const active = bots.filter(bot => bot.status === "active").length;
  const paused = bots.filter(bot => bot.status === "paused").length;

  activeCount.textContent = active;
  pausedCount.textContent = paused;
  totalCount.textContent = bots.length;

  if (bots.length === 0) {
    botsList.innerHTML = `
      <div class="empty-state">
        Nenhum bot cadastrado ainda.
      </div>
    `;
    return;
  }

  botsList.innerHTML = "";

  bots.forEach(bot => {
    const card = document.createElement("article");

    card.className = "bot-card";

    const info = document.createElement("div");
    info.className = "bot-info";

    const name = document.createElement("h3");
    name.textContent = bot.username;

    const id = document.createElement("p");
    id.textContent = "ID: " + bot.id;

    const status = document.createElement("span");
    status.className = "status-pill " +
      (bot.status === "active" ? "status-online" : "status-offline");

    status.textContent =
      bot.status === "active" ? "Ativo" : "Pausado";

    info.append(name, id, status);

    const actions = document.createElement("div");
    actions.className = "bot-actions";

    const toggleButton = document.createElement("button");
    toggleButton.className = "button button-secondary";
    toggleButton.textContent =
      bot.status === "active" ? "Pausar" : "Ativar";

    toggleButton.addEventListener("click", () => {
      updateBot(bot.id,
        bot.status === "active" ? "paused" : "active"
      );
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "button button-danger";
    deleteButton.textContent = "Remover";

    deleteButton.addEventListener("click", () => {
      deleteBot(bot.id);
    });

    actions.append(toggleButton, deleteButton);

    card.append(info, actions);

    botsList.appendChild(card);
  });
}

async function updateBot(id, status) {
  try {
    await api(`/api/bots/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    showToast("Status atualizado!");

    await loadBots();

  } catch (error) {
    showToast(error.message);
  }
}

async function deleteBot(id) {
  const confirmed = confirm(
    "Tem certeza que deseja remover este bot?"
  );

  if (!confirmed) return;

  try {
    await api(`/api/bots/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });

    showToast("Bot removido com sucesso!");

    await loadBots();

  } catch (error) {
    showToast(error.message);
  }
}

openAddBot.addEventListener("click", () => {
  addBotMessage.textContent = "";
  botTokenInput.value = "";
  addBotDialog.showModal();
});

closeAddBot.addEventListener("click", () => {
  addBotDialog.close();
});

cancelAddBot.addEventListener("click", () => {
  addBotDialog.close();
});

addBotForm.addEventListener("submit", async event => {
  event.preventDefault();

  const token = botTokenInput.value.trim();

  if (!token) {
    addBotMessage.textContent = "Informe o token do bot.";
    return;
  }

  const button = addBotForm.querySelector('button[type="submit"]');

  button.disabled = true;
  button.textContent = "Cadastrando...";

  try {
    await api("/api/bots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token })
    });

    addBotDialog.close();

    botTokenInput.value = "";

    showToast("Bot cadastrado com sucesso!");

    await loadBots();

  } catch (error) {
    addBotMessage.textContent = error.message;

  } finally {
    button.disabled = false;
    button.textContent = "Cadastrar bot";
  }
});

// Verifica se já existe uma sessão administrativa.
async function initialize() {
  if (adminKey) {
    const success = await login(adminKey);

    if (success) return;

    sessionStorage.removeItem("gb_admin_key");
  }

  showLogin();
}

initialize();

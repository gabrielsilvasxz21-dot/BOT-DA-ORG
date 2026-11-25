
require("dotenv").config();

const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || "./data";

// IMPORTANTE: troque pelo endereço real do seu GitHub Pages.
const ALLOWED_ORIGIN =
  "https://gabrielsilvasxz21-dot.github.io";

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin === ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "10kb" }));

// BANCO DE DADOS
const databaseFile = path.join(DATA_DIR, "bots.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(databaseFile)) {
  fs.writeFileSync(databaseFile, "[]");
}

function readBots() {
  try {
    const bots = JSON.parse(
      fs.readFileSync(databaseFile, "utf8")
    );

    return Array.isArray(bots) ? bots : [];
  } catch (error) {
    console.error("Erro ao ler banco:", error.message);
    return [];
  }
}

function saveBots(bots) {
  const tempFile = databaseFile + ".tmp";

  fs.writeFileSync(
    tempFile,
    JSON.stringify(bots, null, 2)
  );

  fs.renameSync(tempFile, databaseFile);
}

// CLIENTES DOS BOTS
const botClients = new Map();

async function startBot(botData) {
  if (botClients.has(botData.id)) {
    return true;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  client.on("messageCreate", async message => {
    if (message.author.bot || !message.guild) return;

    if (message.content.trim().toLowerCase() !== ".criar") {
      return;
    }

    const bots = readBots();

    const registered = bots.find(
      bot => bot.id === botData.id
    );

    if (!registered || registered.status !== "active") {
      return;
    }

    await message.reply(
      "CENTRAL DE GB SYSTEM está começando a criar!"
    );

    // A criação de categorias e canais será integrada aqui.
  });

  try {
    await client.login(botData.token);

    botClients.set(botData.id, client);

    console.log("Bot conectado:", client.user.username);

    return true;
  } catch (error) {
    console.error(
      "Erro ao conectar bot:",
      botData.username,
      error.message
    );

    client.destroy();
    return false;
  }
}

function stopBot(botId) {
  const client = botClients.get(botId);

  if (client) {
    client.destroy();
    botClients.delete(botId);
  }
}

// TESTE DA API
app.get("/api/health", (req, res) => {
  res.json({
    online: true,
    system: "CENTRAL DE GB SYSTEM"
  });
});

// LISTAR BOTS
app.get("/api/bots", (req, res) => {
  const bots = readBots();

  res.json(
    bots.map(bot => ({
      id: bot.id,
      username: bot.username,
      status: bot.status,
      createdAt: bot.createdAt
    }))
  );
});

// CADASTRAR BOT
app.post("/api/bots", async (req, res) => {
  const token = req.body?.token;

  if (typeof token !== "string" || !token.trim()) {
    return res.status(400).json({
      error: "Informe o token do bot."
    });
  }

  const cleanToken = token.trim();

  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });

  try {
    await client.login(cleanToken);

    const botId = client.user.id;
    const username = client.user.username;

    client.destroy();

    const bots = readBots();

    if (bots.some(bot => bot.id === botId)) {
      return res.status(409).json({
        error: "Este bot já está cadastrado."
      });
    }

    const botData = {
      id: botId,
      username,
      status: "active",
      token: cleanToken,
      createdAt: new Date().toISOString()
    };

    bots.push(botData);
    saveBots(bots);

    const connected = await startBot(botData);

    if (!connected) {
      const updatedBots = readBots().map(bot =>
        bot.id === botId
          ? { ...bot, status: "paused" }
          : bot
      );

      saveBots(updatedBots);

      return res.status(500).json({
        error: "Bot cadastrado, mas não conseguiu iniciar."
      });
    }

    res.json({
      message: "Bot cadastrado com sucesso!",
      bot: {
        id: botId,
        username,
        status: "active"
      }
    });
  } catch (error) {
    client.destroy();

    console.error("Erro no cadastro:", error.message);

    res.status(400).json({
      error: "Token inválido ou bot não conseguiu conectar."
    });
  }
});

// ATIVAR OU PAUSAR
app.patch("/api/bots/:id", async (req, res) => {
  const { status } = req.body || {};

  if (!["active", "paused"].includes(status)) {
    return res.status(400).json({
      error: "Status inválido."
    });
  }

  const bots = readBots();

  const bot = bots.find(
    item => item.id === req.params.id
  );

  if (!bot) {
    return res.status(404).json({
      error: "Bot não encontrado."
    });
  }

  if (status === "paused") {
    bot.status = "paused";
    saveBots(bots);
    stopBot(bot.id);

    return res.json({
      message: "Bot pausado.",
      status: "paused"
    });
  }

  const connected = await startBot(bot);

  if (!connected) {
    return res.status(500).json({
      error: "Não foi possível conectar o bot."
    });
  }

  bot.status = "active";
  saveBots(bots);

  res.json({
    message: "Bot ativado.",
    status: "active"
  });
});

// REMOVER BOT
app.delete("/api/bots/:id", (req, res) => {
  const bots = readBots();

  const bot = bots.find(
    item => item.id === req.params.id
  );

  if (!bot) {
    return res.status(404).json({
      error: "Bot não encontrado."
    });
  }

  stopBot(bot.id);

  saveBots(
    bots.filter(item => item.id !== bot.id)
  );

  res.json({
    message: "Bot removido com sucesso."
  });
});

// RESTAURAR BOTS
async function restoreBots() {
  console.log("Restaurando bots...");

  for (const bot of readBots()) {
    if (bot.status === "active") {
      await startBot(bot);
    }
  }

  console.log("Restauração finalizada.");
}

// INICIAR SERVIDOR
app.listen(PORT, async () => {
  console.log(
    "CENTRAL DE GB SYSTEM online na porta " + PORT
  );

  await restoreBots();
});

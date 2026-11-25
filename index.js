
require("dotenv").config();

const express = require("express");
const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY;
const DATA_DIR = process.env.DATA_DIR || "./data";

if (!ADMIN_KEY) {
  console.error("Configure ADMIN_KEY no arquivo .env.");
  process.exit(1);
}

const databaseFile = path.join(DATA_DIR, "bots.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(databaseFile)) {
  fs.writeFileSync(databaseFile, "[]");
}

function readBots() {
  try {
    return JSON.parse(fs.readFileSync(databaseFile, "utf8"));
  } catch (error) {
    console.error("Erro ao ler bots.json:", error.message);
    return [];
  }
}

function saveBots(bots) {
  fs.writeFileSync(databaseFile, JSON.stringify(bots, null, 2));
}

function adminOnly(req, res, next) {
  const provided = req.headers["x-admin-key"];

  if (!provided || provided !== ADMIN_KEY) {
    return res.status(401).json({
      error: "Acesso administrativo negado."
    });
  }

  next();
}

const botClients = new Map();

async function startBot(botData) {
  if (botClients.has(botData.id)) {
    return;
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
    const registered = bots.find(bot => bot.id === botData.id);

    if (!registered || registered.status !== "active") {
      await message.reply(
        "Este bot está pausado ou não está autorizado pela CENTRAL DE GB SYSTEM."
      );
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

  } catch (error) {
    console.error(
      "Não foi possível conectar o bot:",
      botData.username,
      error.message
    );

    client.destroy();
  }
}

function stopBot(botId) {
  const client = botClients.get(botId);

  if (client) {
    client.destroy();
    botClients.delete(botId);
  }
}

// LISTAR BOTS
app.get("/api/bots", adminOnly, (req, res) => {
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
app.post("/api/bots", adminOnly, async (req, res) => {
  const token = req.body.token;

  if (typeof token !== "string" || !token.trim()) {
    return res.status(400).json({
      error: "Informe o token do bot."
    });
  }

  const client = new Client({
    intents: [GatewayIntentBits.Guilds]
  });

  try {
    await client.login(token.trim());

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
      token: token.trim(),
      createdAt: new Date().toISOString()
    };

    bots.push(botData);
    saveBots(bots);

    await startBot(botData);

    res.json({
      message: "Bot cadastrado com sucesso.",
      bot: {
        id: botId,
        username,
        status: "active"
      }
    });

  } catch (error) {
    client.destroy();

    console.error("Erro ao cadastrar bot:", error.message);

    res.status(400).json({
      error: "Token inválido ou bot não conseguiu conectar."
    });
  }
});

// ATIVAR OU PAUSAR BOT
app.patch("/api/bots/:id", adminOnly, async (req, res) => {
  const { status } = req.body;

  if (!["active", "paused"].includes(status)) {
    return res.status(400).json({
      error: "Status inválido."
    });
  }

  const bots = readBots();

  const bot = bots.find(item => item.id === req.params.id);

  if (!bot) {
    return res.status(404).json({
      error: "Bot não encontrado."
    });
  }

  bot.status = status;

  saveBots(bots);

  if (status === "paused") {
    stopBot(bot.id);
  } else {
    await startBot(bot);
  }

  res.json({
    message: "Status atualizado.",
    status
  });
});

// REMOVER BOT
app.delete("/api/bots/:id", adminOnly, (req, res) => {
  const bots = readBots();

  const bot = bots.find(item => item.id === req.params.id);

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
    message: "Bot removido da CENTRAL DE GB SYSTEM."
  });
});

// RESTAURAR BOTS AO INICIAR
async function restoreBots() {
  const bots = readBots();

  for (const bot of bots) {
    if (bot.status === "active") {
      await startBot(bot);
    }
  }
}

// INICIAR SERVIDOR
app.listen(PORT, async () => {
  console.log(
    "CENTRAL DE GB SYSTEM online na porta " + PORT
  );

  await restoreBots();
});

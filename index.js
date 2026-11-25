require("dotenv").config();

const express = require("express");
const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY;
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY;
const DATA_DIR = process.env.DATA_DIR || "./data";

if (!ADMIN_KEY || !ENCRYPTION_KEY) {
  console.error("Configure ADMIN_KEY e TOKEN_ENCRYPTION_KEY.");
  process.exit(1);
}

if (!/^[a-fA-F0-9]{64}$/.test(ENCRYPTION_KEY)) {
  console.error("TOKEN_ENCRYPTION_KEY precisa ter 64 caracteres hexadecimais.");
  process.exit(1);
}

const key = Buffer.from(ENCRYPTION_KEY, "hex");
const databaseFile = path.join(DATA_DIR, "bots.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(databaseFile)) {
  fs.writeFileSync(databaseFile, "[]");
}

function readBots() {
  return JSON.parse(fs.readFileSync(databaseFile, "utf8"));
}

function saveBots(bots) {
  fs.writeFileSync(databaseFile, JSON.stringify(bots, null, 2));
}

function encryptToken(token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final()
  ]);

  return {
    iv: iv.toString("hex"),
    data: encrypted.toString("hex"),
    tag: cipher.getAuthTag().toString("hex")
  };
}

function decryptToken(encrypted) {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(encrypted.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(encrypted.tag, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted.data, "hex")),
    decipher.final()
  ]).toString("utf8");
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
    await client.login(decryptToken(botData.token));

    botClients.set(botData.id, client);

    console.log("Bot conectado:", client.user.username);
  } catch (error) {
    console.error("Não foi possível conectar um bot cadastrado.");
    client.destroy();
  }
}

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
      token: encryptToken(token.trim()),
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

    res.status(400).json({
      error: "Token inválido ou bot não conseguiu conectar."
    });
  }
});

app.patch("/api/bots/:id", adminOnly, (req, res) => {
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

  res.json({
    message: "Status atualizado.",
    status
  });
});

app.delete("/api/bots/:id", adminOnly, (req, res) => {
  const bots = readBots();
  const bot = bots.find(item => item.id === req.params.id);

  if (!bot) {
    return res.status(404).json({
      error: "Bot não encontrado."
    });
  }

  const client = botClients.get(bot.id);

  if (client) {
    client.destroy();
    botClients.delete(bot.id);
  }

  saveBots(bots.filter(item => item.id !== bot.id));

  res.json({
    message: "Bot removido da CENTRAL DE GB SYSTEM."
  });
});

async function restoreBots() {
  for (const bot of readBots()) {
    if (bot.status === "active") {
      await startBot(bot);
    }
  }
}

app.listen(PORT, async () => {
  console.log("CENTRAL DE GB SYSTEM online na porta " + PORT);
  await restoreBots();
});

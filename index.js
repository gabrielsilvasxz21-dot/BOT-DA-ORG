
require("dotenv").config();

const express = require("express");
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  OverwriteType
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || "./data";

const ALLOWED_ORIGIN =
  "https://gabrielsilvasxz21-dot.github.io";

// ======================================================
// CORS
// ======================================================

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

// ======================================================
// BANCO DE DADOS
// ======================================================

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

// ======================================================
// CONFIGURAÇÃO DA ESTRUTURA
// ======================================================

const ROLE_NAMES = [
  "Dono",
  "Founder",
  "Ceo",
  "Diretor",
  "Gerente",
  "Spv geral",
  "STAFF",
  "Suporte",
  "TELADOR",
  "Mediador",
  "Analista",
  "BOT",
  "00",
  "👁️",
  "/posse"
];

// Cargos que terão administração completa.
// Ajuste a lista caso queira limitar algum cargo.
const ADMIN_ROLES = [
  "Dono",
  "Founder",
  "Ceo"
];

const STAFF_ROLES = [
  "Diretor",
  "Gerente",
  "Spv geral",
  "STAFF"
];

const PRIVATE_ROLE_GROUPS = {
  "Área Mediador": [
    "Mediador",
    ...STAFF_ROLES,
    ...ADMIN_ROLES
  ],

  "Área Suporte": [
    "Suporte",
    ...STAFF_ROLES,
    ...ADMIN_ROLES
  ],

  "Área Telador": [
    "TELADOR",
    ...STAFF_ROLES,
    ...ADMIN_ROLES
  ],

  "Área Analista": [
    "Analista",
    ...STAFF_ROLES,
    ...ADMIN_ROLES
  ]
};

// Estrutura inicial recuperada das categorias anteriores.
// Os canais abaixo são exemplos de organização.
// Você pode adicionar ou trocar os nomes dentro desta lista.

const STRUCTURE = [
  {
    name: "📌 ・ INFORMAÇÕES",
    channels: [
      { name: "・avisos", type: "text" },
      { name: "・regras", type: "text" },
      { name: "・anúncios", type: "text" }
    ]
  },

  {
    name: "🎫 ・ ATENDIMENTO",
    channels: [
      { name: "・chat", type: "text" },
      { name: "・suporte", type: "text" }
    ]
  },

  {
    name: "🎟️ ・ TICKETS",
    channels: [
      { name: "・abrir-ticket", type: "text" },
      { name: "・tickets", type: "text" }
    ]
  },

  {
    name: "🏆 ・ PARTIDAS",
    channels: [
      { name: "・chat-partidas", type: "text" },
      { name: "・resultados", type: "text" }
    ]
  },

  {
    name: "🐆 ・ PANTERA 5",
    channels: [
      { name: "・chat", type: "text" },
      { name: "・recrutamento", type: "text" }
    ]
  },

  {
    name: "📱 ・ MOBILE",
    channels: [
      { name: "・chat", type: "text" },
      { name: "・recrutamento", type: "text" }
    ]
  },

  {
    name: "🔥 ・ FULL CAPA",
    channels: [
      { name: "・chat", type: "text" },
      { name: "・recrutamento", type: "text" }
    ]
  },

  {
    name: "🖥️ ・ EMULADOR",
    channels: [
      { name: "・chat", type: "text" },
      { name: "・recrutamento", type: "text" }
    ]
  },

  {
    name: "🎮 ・ MISTO",
    channels: [
      { name: "・chat", type: "text" },
      { name: "・recrutamento", type: "text" }
    ]
  },

  {
    name: "💬 ・ COMUNIDADE",
    channels: [
      { name: "・chat-geral", type: "text" },
      { name: "・memes", type: "text" },
      { name: "・divulgação", type: "text" },
      { name: "🔊 ・ CALL GERAL", type: "voice" }
    ]
  },

  {
    name: "🎨 ・ TELAGEM",
    channels: [
      { name: "・chat-telagem", type: "text" },
      { name: "・pedidos", type: "text" }
    ]
  },

  {
    name: "🔗 ・ CONVITE",
    channels: [
      { name: "・convites", type: "text" }
    ]
  },

  {
    name: "🔒 ・ ÁREA MEDIADOR",
    private: true,
    channels: [
      { name: "・chat-mediador", type: "text" },
      { name: "・avisos-mediador", type: "text" },
      { name: "🔊 ・ CALL ADM", type: "voice" }
    ]
  },

  {
    name: "🔒 ・ ÁREA TELADOR",
    private: true,
    channels: [
      { name: "・chat-telador", type: "text" },
      { name: "・pedidos-telador", type: "text" }
    ]
  },

  {
    name: "🔒 ・ ÁREA SUPORTE",
    private: true,
    channels: [
      { name: "・chat-suporte", type: "text" },
      { name: "・atendimentos", type: "text" },
      { name: "🔊 ・ CALL SUP", type: "voice" }
    ]
  },

  {
    name: "🔒 ・ ÁREA ANALISTA",
    private: true,
    channels: [
      { name: "・chat-analista", type: "text" },
      { name: "・relatórios", type: "text" },
      { name: "🔊 ・ CALL ANALISTA", type: "voice" }
    ]
  }
];

// ======================================================
// PERMISSÕES
// ======================================================

function getAdminPermissions() {
  return [
    PermissionFlagsBits.Administrator
  ];
}

function getStaffPermissions() {
  return [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.CreatePublicThreads,
    PermissionFlagsBits.CreatePrivateThreads,
    PermissionFlagsBits.SendMessagesInThreads,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.MentionEveryone,
    PermissionFlagsBits.ManageMessages
  ];
}

function getPrivateViewPermissions() {
  return [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.ReadMessageHistory
  ];
}

function getPrivateStaffPermissions() {
  return [
    PermissionFlagsBits.ViewChannel,
    PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.SendMessagesInThreads,
    PermissionFlagsBits.EmbedLinks,
    PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.MentionEveryone
  ];
}

// ======================================================
// CRIAR CARGOS
// ======================================================

async function createRoles(guild) {
  const roles = new Map();

  for (const roleName of ROLE_NAMES) {
    let role = guild.roles.cache.find(
      item => item.name === roleName
    );

    if (!role) {
      const isAdmin = ADMIN_ROLES.includes(roleName);

      role = await guild.roles.create({
        name: roleName,
        permissions: isAdmin
          ? getAdminPermissions()
          : [],
        reason: "Estrutura CENTRAL DE GB SYSTEM"
      });

      console.log("Cargo criado:", roleName);
    }

    roles.set(roleName, role);
  }

  return roles;
}

// ======================================================
// PERMISSÕES DAS CATEGORIAS
// ======================================================

function getCategoryOverwrites(guild, category, roles) {
  const overwrites = [];

  // @everyone
  overwrites.push({
    id: guild.roles.everyone.id,
    deny: category.private
      ? [PermissionFlagsBits.ViewChannel]
      : [],
    allow: category.private
      ? []
      : [PermissionFlagsBits.ViewChannel]
  });

  // Administradores
  for (const roleName of ADMIN_ROLES) {
    const role = roles.get(roleName);

    if (role) {
      overwrites.push({
        id: role.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.CreatePublicThreads,
          PermissionFlagsBits.CreatePrivateThreads,
          PermissionFlagsBits.SendMessagesInThreads,
          PermissionFlagsBits.MentionEveryone
        ]
      });
    }
  }

  // Equipe geral
  for (const roleName of STAFF_ROLES) {
    const role = roles.get(roleName);

    if (role) {
      overwrites.push({
        id: role.id,
        allow: getStaffPermissions()
      });
    }
  }

  // Cargos específicos de áreas privadas
  if (category.private) {
    const allowedRoles =
      PRIVATE_ROLE_GROUPS[category.name] || [];

    for (const roleName of allowedRoles) {
      const role = roles.get(roleName);

      if (!role) continue;

      const isStaff =
        STAFF_ROLES.includes(roleName) ||
        ADMIN_ROLES.includes(roleName);

      overwrites.push({
        id: role.id,
        allow: isStaff
          ? getPrivateStaffPermissions()
          : getPrivateViewPermissions()
      });
    }
  }

  return overwrites;
}

// ======================================================
// CRIAR CATEGORIAS E CANAIS
// ======================================================

async function createStructure(guild, roles) {
  let categoriesCreated = 0;
  let channelsCreated = 0;
  let channelsExisting = 0;

  for (const categoryData of STRUCTURE) {
    let category = guild.channels.cache.find(
      channel =>
        channel.type === ChannelType.GuildCategory &&
        channel.name === categoryData.name
    );

    if (!category) {
      category = await guild.channels.create({
        name: categoryData.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: getCategoryOverwrites(
          guild,
          categoryData,
          roles
        ),
        reason: "Estrutura CENTRAL DE GB SYSTEM"
      });

      categoriesCreated++;

      console.log(
        "Categoria criada:",
        categoryData.name
      );
    }

    for (const channelData of categoryData.channels) {
      const channelType =
        channelData.type === "voice"
          ? ChannelType.GuildVoice
          : ChannelType.GuildText;

      let channel = guild.channels.cache.find(
        item =>
          item.parentId === category.id &&
          item.name === channelData.name &&
          item.type === channelType
      );

      if (channel) {
        channelsExisting++;
        continue;
      }

      await guild.channels.create({
        name: channelData.name,
        type: channelType,
        parent: category.id,
        reason: "Estrutura CENTRAL DE GB SYSTEM"
      });

      channelsCreated++;

      console.log(
        "Canal criado:",
        channelData.name
      );
    }
  }

  return {
    categoriesCreated,
    channelsCreated,
    channelsExisting
  };
}

// ======================================================
// CRIAR TÓPICO DE EXEMPLO
// ======================================================

async function createExampleThread(guild) {
  const parentChannel = guild.channels.cache.find(
    channel =>
      channel.type === ChannelType.GuildText &&
      channel.name === "・chat-geral"
  );

  if (!parentChannel) {
    return false;
  }

  const threadName = "Central de GB SYSTEM";

  const existingThread =
    parentChannel.threads.cache.find(
      thread => thread.name === threadName
    );

  if (existingThread) {
    return false;
  }

  const starterMessage = await parentChannel.send(
    "Tópico criado pela CENTRAL DE GB SYSTEM."
  );

  await starterMessage.startThread({
    name: threadName,
    autoArchiveDuration: 1440,
    reason: "Tópico inicial do servidor"
  });

  return true;
}

// ======================================================
// CLIENTES DOS BOTS
// ======================================================

const botClients = new Map();
const creatingGuilds = new Set();

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

    if (
      message.content.trim().toLowerCase() !== ".criar"
    ) {
      return;
    }

    const bots = readBots();

    const registered = bots.find(
      bot => bot.id === botData.id
    );

    if (!registered || registered.status !== "active") {
      return;
    }

    const guild = message.guild;

    if (creatingGuilds.has(guild.id)) {
      await message.reply(
        "A estrutura já está sendo criada neste servidor."
      );
      return;
    }

    creatingGuilds.add(guild.id);

    try {
      await message.reply(
        "CENTRAL DE GB SYSTEM está começando a criar!"
      );

      const roles = await createRoles(guild);

      const result = await createStructure(
        guild,
        roles
      );

      const threadCreated =
        await createExampleThread(guild);

      await message.channel.send(
        [
          "CENTRAL DE GB SYSTEM finalizou!",
          "",
          `Categorias criadas: ${result.categoriesCreated}`,
          `Canais criados: ${result.channelsCreated}`,
          `Canais já existentes: ${result.channelsExisting}`,
          `Tópico criado: ${threadCreated ? "Sim" : "Não"}`
        ].join("\n")
      );
    } catch (error) {
      console.error(
        "Erro ao criar estrutura:",
        error
      );

      await message.channel.send(
        "Não consegui concluir a criação. Confira as permissões do bot e os logs da Railway."
      );
    } finally {
      creatingGuilds.delete(guild.id);
    }
  });

  try {
    await client.login(botData.token);

    botClients.set(botData.id, client);

    console.log(
      "Bot conectado:",
      client.user.username
    );

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

// ======================================================
// TESTE DA API
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({
    online: true,
    system: "CENTRAL DE GB SYSTEM"
  });
});

// ======================================================
// LISTAR BOTS
// ======================================================

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

// ======================================================
// CADASTRAR BOT
// ======================================================

app.post("/api/bots", async (req, res) => {
  const token = req.body?.token;

  if (
    typeof token !== "string" ||
    !token.trim()
  ) {
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

    console.error(
      "Erro no cadastro:",
      error.message
    );

    res.status(400).json({
      error: "Token inválido ou bot não conseguiu conectar."
    });
  }
});

// ======================================================
// ATIVAR OU PAUSAR
// ======================================================

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

// ======================================================
// REMOVER BOT
// ======================================================

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

// ======================================================
// RESTAURAR BOTS
// ======================================================

async function restoreBots() {
  console.log("Restaurando bots...");

  for (const bot of readBots()) {
    if (bot.status === "active") {
      await startBot(bot);
    }
  }

  console.log("Restauração finalizada.");
}

// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(PORT, async () => {
  console.log(
    "CENTRAL DE GB SYSTEM online na porta " + PORT
  );

  await restoreBots();
});

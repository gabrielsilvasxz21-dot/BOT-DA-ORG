
require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const app = express();

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const BOTS_FILE = path.join(DATA_DIR, "bots.json");

const SITE_ORIGIN =
  "https://gabrielsilvasxz21-dot.github.io";

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", SITE_ORIGIN);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// ======================================================
// ARQUIVO DE DADOS
// ======================================================

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(BOTS_FILE)) {
  fs.writeFileSync(BOTS_FILE, "[]");
}

function readBots() {
  try {
    return JSON.parse(
      fs.readFileSync(BOTS_FILE, "utf8")
    );
  } catch {
    return [];
  }
}

function saveBots(bots) {
  fs.writeFileSync(
    BOTS_FILE,
    JSON.stringify(bots, null, 2)
  );
}

// ======================================================
// CLIENTES DOS BOTS
// ======================================================

const botClients = new Map();
const servidoresCriando = new Set();

// ======================================================
// CARGOS ORIGINAIS
// ======================================================

const cargos = [
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

// ======================================================
// ESTRUTURA ORIGINAL DOS CANAIS
// ======================================================

const estrutura = [
  ["Informações", [
    ["text", "⚡ ・ rumo-150k"],
    ["text", "📱 ・ redes-sociais"],
    ["text", "🎉 ・ 1-win-20-no-px"],
    ["text", "⚠️ ・ como-transmitir-tela"]
  ]],

  ["Atendimento", [
    ["text", "📬 ・ ticket"]
  ]],

  ["Tickets", [
    ["text", "📘 ・ suporte"],
    ["text", "📘 ・ reembolso"],
    ["text", "📘 ・ receber-evento"],
    ["text", "📘 ・ vagas"],
    ["text", "📘 ・ divulgação"]
  ]],

  ["Partidas", [
    ["text", "⚡ ・ pantera"]
  ]],

  ["PANTERA 5", [
    ["text", "💵 ・ pagar-2-00-208"]
  ]],

  ["Mobile", [
    ["text", "🟡 ・ diario"],
    ["text", "📱 ・ 1x1-mobile"],
    ["text", "📱 ・ 2x2-mobile"],
    ["text", "📱 ・ 3x3-mobile"],
    ["text", "📱 ・ 4x4-mobile"]
  ]],

  ["Full Capa", [
    ["text", "💸 ・ pix-gratis"],
    ["text", "▫️ ・ 1x1-full-capa"],
    ["text", "▫️ ・ 2x2-full-capa"],
    ["text", "▫️ ・ 3x3-full-capa"],
    ["text", "▫️ ・ 4x4-full-capa"]
  ]],

  ["Emulador", [
    ["text", "💻 ・ 1x1-emu"],
    ["text", "💻 ・ 2x2-emu"],
    ["text", "💻 ・ 3x3-emu"],
    ["text", "💻 ・ 4x4-emu"]
  ]],

  ["Misto", [
    ["text", "📱💻 ・ 2x2-misto"],
    ["text", "📱💻 ・ 3x3-misto"],
    ["text", "📱💻 ・ 4x4-misto"]
  ]],

  ["Comunidade", [
    ["text", "📝 ・ vagas"],
    ["text", "🛒 ・ lojinha"],
    ["text", "⚡ ・ roleta"],
    ["text", "☑️ ・ regras"],
    ["text", "📒 ・ regras-x1"],
    ["text", "📒 ・ regras-full-capa"],
    ["text", "👑 ・ ranking"],
    ["text", "🏆 ・ ranking-diario"],
    ["text", "💸 ・ feedback-adm"]
  ]],

  ["Telagem", [
    ["text", "🔍 ・ regras"],
    ["text", "📁 ・ exposed"]
  ]],

  ["Convite", [
    ["text", "✉️ ・ convites"]
  ]],

  ["Área Mediador", [
    ["text", "🔴 ・ regras"],
    ["text", "🔴 ・ avisos-adm"],
    ["text", "🔴 ・ chat-adm"],
    ["text", "🔴 ・ fila-moderador"],
    ["text", "🔴 ・ tabela-de-multas"],
    ["text", "🔴 ・ multa-adm"],
    ["text", "🔴 ・ solicitar-ban"],
    ["text", "🔴 ・ renovação"],
    ["text", "🔴 ・ rank-moderadores"],
    ["text", "🔴 ・ cadastrar-pix"],
    ["voice", "🔊 ・ CALL ADM"],
    ["voice", "🔊 ・ CALL MUSICA"]
  ]],

  ["Área Telador", [
    ["text", "‼️ ・ solicitação-telador"],
    ["text", "🚫 ・ multas-telador"],
    ["text", "🔔 ・ avisos-telador"],
    ["text", "📘 ・ regras-telador"],
    ["text", "🟡 ・ rank-telador"],
    ["text", "🟣 ・ chat-tel"]
  ]],

  ["Área Suporte", [
    ["text", "🔵 ・ ticket-duvidas"],
    ["text", "🔵 ・ fotos-sup-aux"],
    ["text", "🔵 ・ multa-sup-e-aux"],
    ["text", "🔵 ・ regras-suportes-aux"],
    ["text", "🔵 ・ rank-suporte"],
    ["text", "🔵 ・ chat-suporte"],
    ["text", "🔵 ・ ticket-resolvidos"],
    ["text", "🔵 ・ avisos-sup"],
    ["text", "🔵 ・ multas"],
    ["voice", "🔊 ・ CALL SUP"]
  ]],

  ["Área Analista", [
    ["text", "🟡 ・ horarios-ss"],
    ["text", "🟡 ・ chat-ss"],
    ["text", "🟡 ・ tabela-proxy"],
    ["text", "🟡 ・ regras-ss"],
    ["text", "🟡 ・ avisos-ss"],
    ["text", "🟡 ・ solicitar-ss"],
    ["text", "🟡 ・ pagamento-ss"],
    ["voice", "🔊 ・ CALL ANALISTA"]
  ]]
];

// ======================================================
// CRIAR CARGOS
// ======================================================

async function criarCargos(guild) {
  const cargosCriados = new Map();

  for (const nome of cargos) {
    let cargo = guild.roles.cache.find(
      role => role.name === nome
    );

    if (!cargo) {
      const administrador = [
        "Dono",
        "Founder",
        "Ceo"
      ].includes(nome);

      cargo = await guild.roles.create({
        name: nome,
        permissions: administrador
          ? [PermissionFlagsBits.Administrator]
          : [],
        reason: "Organização CENTRAL DE GB SYSTEM"
      });

      console.log("Cargo criado: " + nome);
    }

    cargosCriados.set(nome, cargo);
  }

  return cargosCriados;
}

// ======================================================
// PERMISSÕES DAS CATEGORIAS
// ======================================================

function permissoesCategoria(
  guild,
  nomeCategoria,
  cargosMap
) {
  const overwrites = [];

  const areasPrivadas = [
    "Área Mediador",
    "Área Telador",
    "Área Suporte",
    "Área Analista"
  ];

  const privada = areasPrivadas.includes(nomeCategoria);

  overwrites.push({
    id: guild.roles.everyone.id,
    deny: privada
      ? [PermissionFlagsBits.ViewChannel]
      : [],
    allow: privada
      ? []
      : [PermissionFlagsBits.ViewChannel]
  });

  // Cargos administrativos
  for (const nome of ["Dono", "Founder", "Ceo"]) {
    const cargo = cargosMap.get(nome);

    if (cargo) {
      overwrites.push({
        id: cargo.id,
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

  // Staff geral
  const staff = [
    "Diretor",
    "Gerente",
    "Spv geral",
    "STAFF"
  ];

  for (const nome of staff) {
    const cargo = cargosMap.get(nome);

    if (cargo) {
      overwrites.push({
        id: cargo.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.CreatePublicThreads,
          PermissionFlagsBits.CreatePrivateThreads,
          PermissionFlagsBits.SendMessagesInThreads,
          PermissionFlagsBits.MentionEveryone,
          PermissionFlagsBits.ManageMessages
        ]
      });
    }
  }

  // Áreas privadas
  if (privada) {
    let cargosPermitidos = [];

    if (nomeCategoria === "Área Mediador") {
      cargosPermitidos = ["Mediador"];
    }

    if (nomeCategoria === "Área Telador") {
      cargosPermitidos = ["TELADOR"];
    }

    if (nomeCategoria === "Área Suporte") {
      cargosPermitidos = ["Suporte"];
    }

    if (nomeCategoria === "Área Analista") {
      cargosPermitidos = ["Analista"];
    }

    for (const nome of cargosPermitidos) {
      const cargo = cargosMap.get(nome);

      if (cargo) {
        overwrites.push({
          id: cargo.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.SendMessagesInThreads,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.AttachFiles
          ]
        });
      }
    }
  }

  return overwrites;
}

// ======================================================
// CRIAR CATEGORIAS E CANAIS
// ======================================================

async function criarEstrutura(guild, cargosMap) {
  let criados = 0;
  let existentes = 0;
  const erros = [];

  await guild.channels.fetch();

  for (const item of estrutura) {
    const nomeCategoria = item[0];
    const canais = item[1];

    try {
      let categoria = guild.channels.cache.find(
        canal =>
          canal.type === ChannelType.GuildCategory &&
          canal.name === nomeCategoria
      );

      if (!categoria) {
        categoria = await guild.channels.create({
          name: nomeCategoria,
          type: ChannelType.GuildCategory,
          permissionOverwrites: permissoesCategoria(
            guild,
            nomeCategoria,
            cargosMap
          )
        });

        criados++;
      } else {
        existentes++;
      }

      for (const canalInfo of canais) {
        const tipo = canalInfo[0];
        const nomeCanal = canalInfo[1];

        const tipoDiscord =
          tipo === "voice"
            ? ChannelType.GuildVoice
            : ChannelType.GuildText;

        const existe = guild.channels.cache.find(
          canal =>
            canal.parentId === categoria.id &&
            canal.name === nomeCanal &&
            canal.type === tipoDiscord
        );

        if (existe) {
          existentes++;
          continue;
        }

        await guild.channels.create({
          name: nomeCanal,
          type: tipoDiscord,
          parent: categoria.id
        });

        criados++;

        await new Promise(resolve =>
          setTimeout(resolve, 400)
        );
      }
    } catch (erro) {
      console.error(
        "Erro na categoria: " + nomeCategoria,
        erro
      );

      erros.push(nomeCategoria);
    }
  }

  return {
    criados,
    existentes,
    erros
  };
}

// ======================================================
// COMANDO .CRIAR
// ======================================================

function configurarComandos(client) {
  client.on("messageCreate", async function (message) {
    if (message.author.bot) return;
    if (!message.guild) return;

    if (message.content.trim().toLowerCase() !== ".criar") {
      return;
    }

    if (
      !message.member.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      await message.reply(
        "Você precisa da permissão Gerenciar canais."
      );
      return;
    }

    if (servidoresCriando.has(message.guild.id)) {
      await message.reply(
        "A CENTRAL DE GB SYSTEM já está criando neste servidor."
      );
      return;
    }

    servidoresCriando.add(message.guild.id);

    let status;

    try {
      status = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🚀 CENTRAL DE GB SYSTEM")
            .setDescription(
              "**CENTRAL DE GB SYSTEM está começando a criar!**\n\n" +
              "⏳ Aguarde enquanto os cargos, categorias e canais são criados."
            )
            .setFooter({
              text: "GB SYSTEM • Sistema de organização"
            })
        ]
      });

      const cargosMap = await criarCargos(message.guild);

      const resultado = await criarEstrutura(
        message.guild,
        cargosMap
      );

      let resposta =
        "Finalizado!\n" +
        "Cargos configurados: " + cargos.length + "\n" +
        "Categorias/canais criados: " + resultado.criados +
        "\nJá existentes: " + resultado.existentes;

      if (resultado.erros.length > 0) {
        resposta +=
          "\n\nCategorias com erro: " +
          resultado.erros.join(", ");
      }

      await status.edit({
        embeds: [
          new EmbedBuilder()
            .setColor(
              resultado.erros.length > 0
                ? "#FFA500"
                : "#57F287"
            )
            .setTitle("✅ CENTRAL DE GB SYSTEM")
            .setDescription(resposta)
            .setFooter({
              text: "GB SYSTEM • Sistema de organização"
            })
            .setTimestamp()
        ]
      });
    } catch (erro) {
      console.error("Erro geral ao criar:", erro);

      if (status) {
        await status.edit({
          content:
            "Ocorreu um erro durante a criação. Confira os logs da Railway e as permissões do bot.",
          embeds: []
        }).catch(() => {});
      }
    } finally {
      servidoresCriando.delete(message.guild.id);
    }
  });
}

// ======================================================
// INICIAR BOT PELO TOKEN DO SITE
// ======================================================

async function startBot(botData) {
  if (!botData || !botData.token) {
    throw new Error("Token do bot não informado.");
  }

  if (botClients.has(botData.id)) {
    return botClients.get(botData.id);
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  configurarComandos(client);

  client.once("ready", function () {
    console.log("Bot conectado: " + client.user.tag);
    console.log("CENTRAL DE GB SYSTEM");
    console.log("Comando: .criar");
  });

  client.on("error", erro => {
    console.error("Erro no bot " + botData.id, erro);
  });

  await client.login(botData.token);

  botClients.set(botData.id, client);

  return client;
}

function stopBot(botId) {
  const client = botClients.get(botId);

  if (client) {
    client.destroy();
    botClients.delete(botId);
  }
}

// ======================================================
// API - STATUS DO RAILWAY
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({
    online: true,
    service: "CENTRAL GB SYSTEM"
  });
});

// ======================================================
// API - LISTAR BOTS
// ======================================================

app.get("/api/bots", (req, res) => {
  const bots = readBots();

  res.json(
    bots.map(bot => {
      const client = botClients.get(bot.id);

      return {
        id: bot.id,
        name: bot.name || "Bot Discord",
        active: bot.active !== false,
        online: Boolean(client && client.isReady())
      };
    })
  );
});

// ======================================================
// API - CADASTRAR BOT PELO SITE
// ======================================================

app.post("/api/bots", async (req, res) => {
  const token =
    typeof req.body.token === "string"
      ? req.body.token.trim()
      : "";

  if (!token) {
    return res.status(400).json({
      error: "Informe o token do bot."
    });
  }

  const bots = readBots();

  const botData = {
    id: crypto.randomUUID(),
    token,
    name: "Bot Discord",
    active: true
  };

  try {
    const client = await startBot(botData);

    botData.name = client.user.username;

    bots.push(botData);
    saveBots(bots);

    return res.status(201).json({
      success: true,
      bot: {
        id: botData.id,
        name: botData.name,
        active: true,
        online: client.isReady()
      }
    });
  } catch (erro) {
    console.error("Erro cadastrando bot:", erro);

    stopBot(botData.id);

    return res.status(400).json({
      error: "Não foi possível conectar. Confira o token do bot."
    });
  }
});

// ======================================================
// API - ATIVAR OU PAUSAR BOT
// ======================================================

app.patch("/api/bots/:id", async (req, res) => {
  const bots = readBots();
  const bot = bots.find(item => item.id === req.params.id);

  if (!bot) {
    return res.status(404).json({
      error: "Bot não encontrado."
    });
  }

  if (typeof req.body.active !== "boolean") {
    return res.status(400).json({
      error: "Informe active como true ou false."
    });
  }

  if (req.body.active) {
    try {
      await startBot(bot);
      bot.active = true;
    } catch (erro) {
      console.error("Erro ativando bot:", erro);

      return res.status(400).json({
        error: "Não foi possível ativar o bot."
      });
    }
  } else {
    bot.active = false;
    stopBot(bot.id);
  }

  saveBots(bots);

  const client = botClients.get(bot.id);

  return res.json({
    success: true,
    bot: {
      id: bot.id,
      name: bot.name,
      active: bot.active,
      online: Boolean(client && client.isReady())
    }
  });
});

// ======================================================
// API - REMOVER BOT
// ======================================================

app.delete("/api/bots/:id", (req, res) => {
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

  return res.json({
    success: true
  });
});

// ======================================================
// RESTAURAR BOTS ATIVOS AO REINICIAR O RAILWAY
// ======================================================

async function restaurarBots() {
  const bots = readBots();

  for (const bot of bots) {
    if (bot.active === false) continue;

    try {
      await startBot(bot);
    } catch (erro) {
      console.error(
        "Não foi possível iniciar o bot " + bot.name,
        erro
      );
    }
  }
}

// ======================================================
// INICIAR SERVIDOR
// ======================================================

app.listen(PORT, async () => {
  console.log(
    "CENTRAL GB SYSTEM online na porta " + PORT
  );

  await restaurarBots();
});

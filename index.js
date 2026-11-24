
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.log("Configure as variáveis do Railway.");
  process.exit(1);
}

const estrutura = [
  ["Informações", [
    ["text", "⚡ ・ rumo-1k"],
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
    ["text", "⚡・seu nome"]
  ]],

  ["fila exemplo 5", [
    ["text", "💵・pagar-2-00-208"]
  ]],

  ["Mobile", [
    ["text", "🟡・nome canal"],
    ["text", "📱・1x1-mobile"],
    ["text", "📱・2x2-mobile"],
    ["text", "📱・3x3-mobile"],
    ["text", "📱・4x4-mobile"]
  ]],

  ["Full Capa", [
    ["text", "💸・pix-gratis"],
    ["text", "▫️・1x1-full-capa"],
    ["text", "▫️・2x2-full-capa"],
    ["text", "▫️・3x3-full-capa"],
    ["text", "▫️・4x4-full-capa"]
  ]],

  ["Emulador", [
    ["text", "💻・1x1-emu"],
    ["text", "💻・2x2-emu"],
    ["text", "💻・3x3-emu"],
    ["text", "💻・4x4-emu"]
  ]],

  ["Misto", [
    ["text", "📱💻・2x2-misto"],
    ["text", "📱💻・3x3-misto"],
    ["text", "📱💻・4x4-misto"]
  ]],

  ["Comunidade", [
    ["text", "📝・vagas"],
    ["text", "🛒・lojinha"],
    ["text", "⚡・roleta"],
    ["text", "☑️・regras"],
    ["text", "📒・regras-x1"],
    ["text", "📒・regras-full-capa"],
    ["text", "👑・ranking"],
    ["text", "🏆・ranking-diario"],
    ["text", "💸・feedback-adm"]
  ]],

  ["Telagem", [
    ["text", "🔍・regras"],
    ["text", "📁・exposed"]
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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// COMANDO .CRIAR
client.once("ready", function () {
  console.log("Bot conectado: " + client.user.tag);
  console.log("CENTRAL DE GB SYSTEM");
  console.log("Comando: .criar");
});

client.on("messageCreate", async function (message) {
  if (message.author.bot) return;
  if (!message.guild) return;

  if (message.content.trim().toLowerCase() !== ".criar") return;

  if (!message.member.permissions.has(
    PermissionFlagsBits.ManageChannels
  )) {
    await message.reply({
      content: "Você precisa da permissão Gerenciar canais."
    });
    return;
  }

  await message.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("🚀 CENTRAL DE GB SYSTEM")
        .setDescription(
          "**Está começando a criar a estrutura do servidor!**\n\n" +
          "⏳ Aguarde enquanto as categorias e canais são criados."
        )
        .setFooter({
          text: "GB SYSTEM • Sistema de organização"
        })
    ]
  }).then(async function (status) {

    let criados = 0;
    let existentes = 0;
    let erros = [];

    for (const item of estrutura) {
      const nomeCategoria = item[0];
      const canais = item[1];

      try {
        let categoria = message.guild.channels.cache.find(
          function (canal) {
            return canal.type === ChannelType.GuildCategory &&
              canal.name === nomeCategoria;
          }
        );

        if (!categoria) {
          categoria = await message.guild.channels.create({
            name: nomeCategoria,
            type: ChannelType.GuildCategory
          });

          criados++;
        }

        for (const canalInfo of canais) {
          const tipo = canalInfo[0];
          const nomeCanal = canalInfo[1];

          const existe = message.guild.channels.cache.find(
            function (canal) {
              return canal.parentId === categoria.id &&
                canal.name === nomeCanal;
            }
          );

          if (existe) {
            existentes++;
            continue;
          }

          await message.guild.channels.create({
            name: nomeCanal,
            type: tipo === "voice"
              ? ChannelType.GuildVoice
              : ChannelType.GuildText,
            parent: categoria.id
          });

          criados++;

          await new Promise(function (resolve) {
            setTimeout(resolve, 400);
          });
        }

      } catch (erro) {
        console.log("Erro na categoria: " + nomeCategoria);
        console.log(erro);
        erros.push(nomeCategoria);
      }
    }

    let resposta =
      "Finalizado! Criados: " + criados +
      " | Já existentes: " + existentes;

    if (erros.length > 0) {
      resposta += "\nCategorias com erro: " + erros.join(", ");
    }

    await status.edit({
      embeds: [
        new EmbedBuilder()
          .setColor(erros.length > 0 ? "#FFA500" : "#57F287")
          .setTitle("✅ CENTRAL DE GB SYSTEM")
          .setDescription(resposta)
          .setFooter({
            text: "GB SYSTEM • Sistema de organização"
          })
          .setTimestamp()
      ]
    });
  });
});

client.login(TOKEN);

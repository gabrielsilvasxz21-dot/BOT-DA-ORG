
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
  console.log("ERRO: Configure DISCORD_TOKEN no Railway.");
  process.exit(1);
}

// ESTRUTURA COMPLETA DO SERVIDOR
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

// CLIENTE DO DISCORD
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// CONTROLE PARA NÃO EXECUTAR DUAS VEZES
const criandoServidores = new Set();

// BOT ONLINE
client.once("ready", () => {
  console.log("==================================");
  console.log("CENTRAL DE GB SYSTEM");
  console.log("Bot conectado: " + client.user.tag);
  console.log("Comando: .criar");
  console.log("==================================");
});

// COMANDO .CRIAR
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.content.trim().toLowerCase() !== ".criar") return;

  if (!message.member.permissions.has(
    PermissionFlagsBits.ManageChannels
  )) {
    return message.reply(
      "❌ Você precisa da permissão Gerenciar canais."
    );
  }

  const guildId = message.guild.id;

  if (criandoServidores.has(guildId)) {
    return message.reply(
      "⏳ A estrutura já está sendo criada neste servidor!"
    );
  }

  criandoServidores.add(guildId);

  try {
    // MENSAGEM INICIAL
    const inicio = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("🚀 CENTRAL DE GB SYSTEM")
      .setDescription(
        "**Está começando a criar a estrutura do servidor!**\n\n" +
        "⏳ Aguarde enquanto as categorias e canais são criados.\n\n" +
        "📂 Preparando estrutura..."
      )
      .setFooter({
        text: "GB SYSTEM • Sistema de organização"
      })
      .setTimestamp();

    const status = await message.reply({
      embeds: [inicio]
    });

    let criados = 0;
    let existentes = 0;
    let erros = [];

    // CRIAÇÃO DAS CATEGORIAS E CANAIS
    for (const [nomeCategoria, canais] of estrutura) {
      try {
        let categoria = message.guild.channels.cache.find(
          canal =>
            canal.type === ChannelType.GuildCategory &&
            canal.name === nomeCategoria
        );

        if (!categoria) {
          categoria = await message.guild.channels.create({
            name: nomeCategoria,
            type: ChannelType.GuildCategory
          });

          criados++;
        }

        for (const [tipo, nomeCanal] of canais) {
          const existe = message.guild.channels.cache.find(
            canal =>
              canal.parentId === categoria.id &&
              canal.name === nomeCanal
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

          await new Promise(resolve =>
            setTimeout(resolve, 500)
          );
        }

      } catch (erro) {
        console.log("Erro na categoria: " + nomeCategoria);
        console.log(erro);
        erros.push(nomeCategoria);
      }
    }

    // RESULTADO FINAL
    const final = new EmbedBuilder()
      .setColor(erros.length > 0 ? "#FFA500" : "#57F287")
      .setTitle("✅ CENTRAL DE GB SYSTEM")
      .setDescription(
        "**Criação da estrutura finalizada!**\n\n" +
        "📁 **Criados:** " + criados + "\n" +
        "📌 **Já existentes:** " + existentes + "\n\n" +
        (
          erros.length > 0
            ? "⚠️ **Categorias com erro:**\n" + erros.join("\n")
            : "🎉 Todos os canais foram processados com sucesso!"
        )
      )
      .setFooter({
        text: "GB SYSTEM • Sistema de organização"
      })
      .setTimestamp();

    await status.edit({
      embeds: [final]
    });

  } catch (erro) {
    console.log("Erro geral ao criar estrutura:", erro);

    await message.reply(
      "❌ Ocorreu um erro ao criar a estrutura. Verifique os logs do Railway."
    );

  } finally {
    criandoServidores.delete(guildId);
  }
});

// CONECTAR BOT
client.login(TOKEN);

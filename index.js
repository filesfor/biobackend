const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const cors = require("cors");
const axios = require("axios");
const fs = require("node:fs");

const app = express();
const port = 3000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

client.once("ready", () => {
  console.log("Discord bot ready!");
});

client.login(process.env.TOKEN);

app.use(cors());

app.get("/invite/:inv_code", async (req, res) => {
  try {
    const inv_code = req.params.inv_code;
    const response = await axios.get(
      `https://discord.com/api/v9/invites/${inv_code}?with_counts=true`,
      {
        headers: {
          Authorization: `Bot ${process.env.TOKEN}`,
        },
      },
    );
    const guildData = {
      approximate_presence_count: response.data.approximate_presence_count,
      approximate_member_count: response.data.approximate_member_count,
      name: response.data.guild.name,
    };
    res.json(guildData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/discord/api/v9/users/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const response = await axios.get(
      `https://discord.com/api/v9/users/${user_id}`,
      {
        headers: {
          Authorization: `Bot ${process.env.TOKEN}`,
        },
      },
    );
    const userData = {
      username: response.data.username,
      avatar: response.data.avatar,
      discriminator: response.data.discriminator,
      id: response.data.id,
    };
    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/discord/api/v9/users/:user-id/profile", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const response = await axios.get(
      `https://discord.com/api/v9/users/${user - id}/profile`,
      {
        headers: {
          Authorization: `Bot ${process.env.TOKEN}`,
        },
      },
    );
    const userData = {
      username: response.data.username,
      avatar: response.data.avatar,
      discriminator: response.data.discriminator,
      id: response.data.id,
    };
    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/discord-status/:userId", async (req, res) => {
  try {
    console.log("RECEIVED");
    const userId = req.params.userId;

    const guild = client.guilds.cache.first();
    if (!guild) {
      return res.status(404).json({ error: "Bot is not in any guilds." });
    }

    const user = await client.users.fetch(userId);
    const member = await guild.members.fetch(userId);
    let status = member.presence ? member.presence.status : "offline";

    if (status === "dnd") {
      status = "User is on Do Not Disturb";
    } else if (status === "offline") {
      status = "User is Offline";
    } else if (status === "online") {
      status = "User is Online";
    } else if (status === "idle") {
      status = "User is Idle";
    }

    res.json({
      username: user.username,
      avatar: user.displayAvatarURL(),
      status: status,
    });
    const downloadurl =
      "https://cdn.discordapp.com/avatars/898859607391354891/aa5277c53967c297365ff8fd2990c791.webp";

    async function download() {
      const response = await fetch(downloadurl);
      const buffer = await response.buffer();
      fs.writeFile(`./image.webp`, buffer, () =>
        console.log("finished downloading!"),
      );
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on("SIGINT", () => {
  client.destroy();
  process.exit();
});


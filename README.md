<div align="center">
<h1>Hoshimi</h1>
<p>A lavalink@v4 client easy to use, up-to-date</p>
<div align="center">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/MIT-green?style=for-the-badge" />
</div>
<br/>
<img alt="hoshimi" src="./assets/logo.png" />

![NPM Version](https://img.shields.io/npm/v/hoshimi?style=for-the-badge&logo=npm)
![NPM Downloads](https://img.shields.io/npm/dm/hoshimi?style=for-the-badge)

<p>
    <a href="https://www.npmjs.com/package/hoshimi">
        <img src="https://nodei.co/npm/hoshimi.png?downloads=true&stars=true" alt="NPM Install: hoshimi" />
    </a>
</p>
</div>

## 📦 Features
- 📋 **v4**: Fully supports the latest v4 lavalink features.
- 🔗 **Node Manager**: Manage nodes, auto least‑used selection by penalties, session resume and more.
- ▶️ **Autoplay**: YouTube and Spotify recommendations out of the box; easily extend with your own function.
- 📝 **Lyrics**: Control your lyrics with live-lyrics updates; validates required plugins.
- 🌐 **REST + WebSocket**: Typed REST helpers, player/session control, decode single/multiple tracks.
- 📣 **Events**: Granular events with debug levels.
- 🧩 **Extensible**: Override structures with your own ones.
- 🧪 **Safety & DX**: Strict validation, descriptive errors, TypeScript-first API build, and formatting/linting.
- 📜 **Filters (WIP)**: Built-in filters, easy management and easy to use!  

## ⚙️ Requirements
- **Runtime** - atleast one of:
  - [Node.js](https://nodejs.org) v22+
  - [Bun](https://bun.com) v1.3+
  - [Deno](https://deno.com) v2.5+ (unstable)

## 📦 Installation

```sh
# Stable... and the development one (unstable)...

# Using NPM
npm install hoshimi # Stable
npm install https://github.com/Ganyu-Studios/Hoshimi.git # Development

# Using PNPM
pnpm install hoshimi
pnpm install https://github.com/Ganyu-Studios/Hoshimi.git

# Using YARN
yarn add hoshimi
yarn add https://github.com/Ganyu-Studios/Hoshimi.git

# Using BUN
bun add hoshimi
bun add https://github.com/Ganyu-Studios/Hoshimi.git

```

## 📜 Basic Setup

You can read [this](/bot/src/index.ts) or you can follow this one:

```typescript
import { Hoshimi } from "hoshimi"; // She is all ears!
import { Client } from "seyfert"; // Only example client, you can use whatever you want...

const client = new Client(); // https://www.seyfert.dev/guide

const hoshimi = new Hoshimi({
    nodes: [
        {
            host: "localhost",
            port: 2333,
            password: "youshallnotpass",
        },
    ], // Add more nodes if you want!
    sendPayload(guildId, payload) {
        // You client send to shard payload function
        client.gateway.send(client.gateway.calculateShardId(guildId), payload);
    },
});

// FOLLOW YOU CLIENT EVENT IMPLEMENTATION
// THIS IS ONLY A EXAMPLE, NOT A REAL USAGE
client.events.values.READY = {
    __filePath: null,
    data: { name: "ready", once: true },
    run(user, client) {
        client.logger.info(`Logged in as ${user.username}`);
        
        // Call the manager to initialize hoshimi
        hoshimi.init({ ...user, username: user.username });
    },
};

client.events.values.RAW = {
    __filePath: null,
    data: { name: "raw" },
    async run(data, client) {
        // Call the handler on the gateway dispatch events
        await hoshimi.updateVoiceState(data);
    },
};

(async () => {
    await client.start()
})();
```

## 💖 Used By

- For now, no one is using it :(

## 📝 Additional Notes
I am currently working on this package. It is not ready for use yet. </br> This
package takes some ideas provided from libraries like:

- 📦 [`lavalink-client`](https://github.com/Tomato6966/lavalink-client/)
- 📦 [`kazagumo`](https://github.com/Takiyo0/Kazagumo)
- 📦 [`distube`](https://github.com/skick1234/DisTube)
- 📦 [`discord-player`](https://github.com/Androz2091/discord-player)
- 📦 [`shoukaku`](https://github.com/shipgirlproject/Shoukaku)

**I'm not stealing their job, I love their job, all of them, I just taked some
stuff because i'm too lazy to make my own.**</br> If anyone of them want's to
talk me to remove some stuff, they can.</br>

But made with my code style and my knowledge and of course up-to-date.

## 📝 License

Copyright © 2025 [Ganyu Studios](https://github.com/Ganyu-Studios).

This project is [MIT](LICENSE) licensed.

- *The character and assets are not my property, property of miHoYo Co. Ltd. (HoYoverse)*

> *Made with 🐐❤️💪... A project made by the community, for the community.*
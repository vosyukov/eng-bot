# Telegram Bot with Inline Buttons

A TypeScript-based Telegram bot that demonstrates the usage of inline buttons
and keyboard markup.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Telegram Bot Token (get it from [@BotFather](https://t.me/BotFather))

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your bot token:

```
BOT_TOKEN=your_bot_token_here
```

## Running the Bot

For development:

```bash
npm run dev
# or
yarn dev
```

For production:

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Features

- Inline keyboard buttons
- URL buttons
- Button click handling
- Environment variables support
- TypeScript support

## Bot Commands

- `/start` - Displays welcome message with inline keyboard buttons

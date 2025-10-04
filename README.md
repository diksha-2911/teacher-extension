# TextSnap

Textsnap is a lightweight Chrome extension designed for academics and researchers. It reads the content of a webpage and allows you to quickly generate summaries or translations of selected text. Additionally, it integrates with your Obsidian vault via the Obsidian MCP server, enabling you to directly save notes to markdown files without switching windows.

The goal of Textsnap is to streamline research workflows, improve focus, and reduce the friction of note-taking, all while keeping the extension easy to use.

# Features

1. **Text Summarization**: Generate concise summaries of selected text.

2. **Text Translation:** Translate selected content into different languages.

3. **Obsidian Integration:** Save your notes directly to your Obsidian vault via the MCP server.

4. **Lightweight & Fast:** Minimal interface designed for academics, ensuring smooth and distraction-free usage.

5. **Focus on Workflow:** No need to copy-paste or switch windows while researching.

# Tech Stack & Architecture

## Frontend:

1. Built using `chrome-extension-cli`

2. JavaScript, HTML, CSS

## Backend:

1. JavaScript and Python for connecting to the Obsidian MCP server

2. Handles API requests, note saving, and communication between the extension and Obsidian

## APIs & Services:

1. **Cerebras API** - for text summarization and translation

2. **Obsidian API** - to interact with your Obsidian vault

3. **MCP Gateway** - facilitates client-server communication between Textsnap and Obsidian

# Installation

1. Clone or download this repository.

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable Developer mode (toggle in the top-right corner).

4. Click Load unpacked and select the directory of the extension.

# Project Setup

Get your Cerebras API key from [here](https://cloud.cerebras.ai/)

Get you Obsidian API key by adding `obsidian-local-rest-api` community plugin in your Obsidian app

**Run frontend**

```
npm install
```

```
npm run watch
```

**Run backend**

```
docker compose up --build
```

# Project Flow

The following flow-chart showcases the project flow
<img width="1430" height="717" alt="Screenshot 2025-10-04 230644" src="https://github.com/user-attachments/assets/16a450ae-9c01-4262-b65f-5e1486c55ac7" />

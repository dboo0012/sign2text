# sign2text

WASL Sign Language Recognition interface authored by Team MCS12 - FIT3162.

# Design

<img width="512" height="267" alt="image" src="https://github.com/user-attachments/assets/a62213ad-2a5f-46e2-a453-cb4b5769db3a" />

# API

https://github.com/dboo0012/sign2text-api

# Tech stack

## Frontend

- **Typescript** - Primary frontend programming language
- **React** - Main UI framework
- **Web Workers** - Non-blocking pose estimation processing
- **TailwindCSS** - Styling components

## Backend

- **Python** - Primary backend programming language
- **FastAPI** - Modern Python web framework with async support
- **PyTorch** - Deep learning framework for UniSign model
- **AsyncIO** - Asynchronous programming for performance

## Communication & Real-time Processing

- **WebSocket** - Real-time bidirectional communication protocol

# Prerequisites

- [NodeJS 22.17.1](https://nodejs.org/en/download)
- Enable exec policy if `npm.ps1 cannot be loaded error` pops up during installation.
  - Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` in windows powershell.

# Running the app

```
git clone <repo>
cd /sign2text
npm i
npm run dev
```

# Using OpenAi services

```
// Add to .env
VITE_OPENAI_API_KEY=''
```

# Note

- Currently a timer to display fixed text output is in place to show the flow more consistently, to view the actual latency of model inferenced output, remove the timer logic and the code would work as expected still.
- However, incoming inference output would still override the fixed text once received from backend.

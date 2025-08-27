# sign2text

WASL Sign Language Recognition interface authored by Team MCS12 - FIT3162.

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

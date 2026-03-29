# ReVogue LiveKit Chat Agent

Text-only LiveKit agent for ReVogue. Users send messages on the `lk.chat` topic; the agent replies on `lk.transcription`. No voice/video — chat only.

## Requirements

- Python >= 3.10
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (recommended) or pip
- [LiveKit Cloud](https://cloud.livekit.io/) account (or self-hosted LiveKit server)

## Setup

1. **Create env file**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and set:

   - `LIVEKIT_URL` – e.g. `wss://your-project.livekit.cloud`
   - `LIVEKIT_API_KEY` – from LiveKit Cloud project settings
   - `LIVEKIT_API_SECRET` – from LiveKit Cloud project settings

   (Optional: `OPENAI_API_KEY` only if you switch to a plugin that calls OpenAI directly.)

2. **Install dependencies**

   With uv (from repo root or from `agent/`):

   ```bash
   cd agent
   uv sync
   ```

   Or with pip:

   ```bash
   cd agent
   pip install -e .
   ```

## Run

From the `agent/` directory:

- **Dev** (connects to LiveKit; use with Playground or your app):

  ```bash
  uv run agent.py dev
  ```

- **Console** (text chat in the terminal):

  ```bash
  uv run agent.py console
  ```

- **Production**:

  ```bash
  uv run agent.py start
  ```

## Frontend (later)

- Send user messages to topic `lk.chat` (e.g. `room.localParticipant.sendText(text, { topic: 'lk.chat' })`).
- Subscribe to `lk.transcription` (or use your SDK’s text stream API) to show agent replies.

## Docs

- [LiveKit Agents](https://docs.livekit.io/agents/)
- [Text and transcriptions](https://docs.livekit.io/agents/multimodality/text/)
- [Voice AI quickstart (Python)](https://docs.livekit.io/agents/start/voice-ai-quickstart/)

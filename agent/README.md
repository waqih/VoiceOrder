# VoiceOrder AI — Voice Agent

Voice AI pipeline for restaurant phone ordering. Built with LiveKit Agents SDK, Deepgram STT, OpenAI GPT-4.1, and Cartesia TTS.

## Architecture

```
Caller → Twilio → LiveKit → Deepgram STT → GPT-4.1 → Cartesia TTS → Audio back
```

## Prerequisites

Sign up for free tiers:

1. **LiveKit Cloud** — https://cloud.livekit.io (create a project)
2. **Deepgram** — https://console.deepgram.com ($200 free credits)
3. **OpenAI** — https://platform.openai.com/api-keys
4. **Cartesia** — https://play.cartesia.ai (free tier)

## Setup

```bash
# Install uv if you don't have it
curl -LsSf https://astral.sh/uv/install.sh | sh

# Clone and enter the agent directory
cd agent

# Copy env template and fill in your API keys
cp .env.example .env

# Install dependencies
uv sync

# Run in development mode
uv run python src/voiceorder/agent.py dev
```

## Testing

1. Start the agent with `uv run python src/voiceorder/agent.py dev`
2. Open the LiveKit Agents Playground: https://agents-playground.livekit.io
3. Connect using your LiveKit Cloud project credentials
4. Speak to the AI — it should respond as a restaurant assistant

### Things to try

- "Hi, what's on your menu?"
- "I'd like to order a Margherita pizza and a Tiramisu"
- "What are your hours today?"

## Project Structure

```
agent/
├── src/voiceorder/
│   ├── agent.py        # Main LiveKit agent entry point
│   ├── prompts.py      # System prompt for restaurant assistant
│   └── tools.py        # LLM function tools (menu, orders, hours)
├── .env.example        # API key template
├── pyproject.toml      # Python dependencies
└── Dockerfile          # Container deployment
```

## Docker

```bash
docker build -t voiceorder-agent .
docker run --env-file .env voiceorder-agent
```

"""VoiceOrder AI — Main voice agent entry point.

Run in development mode:
    uv run python src/voiceorder/agent.py dev

Run in production mode:
    uv run python src/voiceorder/agent.py start
"""

import logging

from dotenv import load_dotenv

from livekit.agents import (
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    cli,
    metrics,
    room_io,
)
from livekit.agents.voice import MetricsCollectedEvent
from livekit.plugins import cartesia, deepgram, google, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

from voiceorder.prompts import HOSPITAL_SYSTEM_PROMPT
from voiceorder.tools import HospitalTools

load_dotenv()

logger = logging.getLogger("voiceorder")


class HospitalAgent(HospitalTools):
    """Voice agent for clinic/hospital phone reception."""

    def __init__(self) -> None:
        super().__init__(
            instructions=HOSPITAL_SYSTEM_PROMPT,
        )

    async def on_enter(self) -> None:
        """Called when a caller connects. Generate the initial greeting."""
        self.session.generate_reply(
            instructions="Greet the caller warmly. Say something like: "
            "'Thank you for calling CarePoint Medical Center. How may I help you today?'"
        )


# --- Server setup ---

server = AgentServer()


def prewarm(proc: JobProcess) -> None:
    """Pre-load heavy models once per worker process."""
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session()
async def entrypoint(ctx: JobContext) -> None:
    """Called for each new phone call / room session."""

    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="en"),
        llm=google.LLM(model="gemini-2.5-flash"),
        tts=cartesia.TTS(model="sonic-3"),
        vad=ctx.proc.userdata["vad"],
        turn_detection=MultilingualModel(),
    )

    # --- Metrics logging ---
    usage_collector = metrics.UsageCollector()

    @session.on("metrics_collected")
    def _on_metrics_collected(ev: MetricsCollectedEvent) -> None:
        metrics.log_metrics(ev.metrics)
        usage_collector.collect(ev.metrics)

    async def _log_usage() -> None:
        summary = usage_collector.get_summary()
        logger.info(f"Usage summary: {summary}")

    ctx.add_shutdown_callback(_log_usage)

    # --- Start the session ---
    await session.start(
        agent=HospitalAgent(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(),
        ),
    )


def main() -> None:
    cli.run_app(server)


if __name__ == "__main__":
    main()

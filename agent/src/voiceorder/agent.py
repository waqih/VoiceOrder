"""VoiceOrder AI — Main voice agent entry point.

Run in development mode:
    uv run python src/voiceorder/agent.py dev

Run in production mode:
    uv run python src/voiceorder/agent.py start
"""

import logging
import time
import uuid

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
from livekit.rtc import ParticipantKind

from voiceorder.api_client import VoiceOrderAPI
from voiceorder.prompts import HOSPITAL_SYSTEM_PROMPT
from voiceorder.tools import HospitalTools

load_dotenv()

logger = logging.getLogger("voiceorder")

# Default business ID for the seeded CarePoint demo business
DEFAULT_BUSINESS_ID = uuid.UUID("00000000-0000-0000-0000-000000000010")


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


@server.rtc_session(agent_name="hospital-agent")
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

    # --- SIP call detection & logging ---
    api = VoiceOrderAPI()
    call_id: uuid.UUID | None = None
    call_start: float = time.time()
    caller_phone: str | None = None

    for p in ctx.room.remote_participants.values():
        if p.kind == ParticipantKind.PARTICIPANT_KIND_SIP:
            caller_phone = (p.attributes or {}).get("sip.phoneNumber")
            logger.info(f"SIP caller detected: {caller_phone}")
            break

    if caller_phone:
        try:
            result = await api.create_call(
                business_id=DEFAULT_BUSINESS_ID,
                caller_phone=caller_phone,
                called_number=(p.attributes or {}).get("sip.calledNumber"),
            )
            call_id = uuid.UUID(result["id"])
            logger.info(f"Call logged: {call_id}")
        except Exception:
            logger.exception("Failed to log call start")

    async def _finalize_call() -> None:
        if call_id:
            duration = int(time.time() - call_start)
            try:
                await api.update_call(
                    call_id, status="completed", duration_seconds=duration
                )
                logger.info(f"Call {call_id} finalized: {duration}s")
            except Exception:
                logger.exception("Failed to finalize call")
        await api.close()

    ctx.add_shutdown_callback(_finalize_call)

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

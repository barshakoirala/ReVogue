"""
ReVogue LiveKit chat agent (text-only).
Listens on lk.chat for messages and replies via lk.transcription.
Run: uv run agent.py dev  (or: console, start)
"""
import logging

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    cli,
    inference,
    room_io,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("revogue-agent")

# Load .env.local first, then .env
load_dotenv(".env.local")
load_dotenv()


class ReVogueAssistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""You are the ReVogue style assistant. You help users with fashion, styling, and their wardrobe.
You are friendly, concise, and give practical advice. You know about ReVogue as a fashion/second-hand platform.
You do not use emojis, asterisks, or complex formatting in your replies. Keep answers clear and short."""
        )


server = AgentServer()


async def log_and_reply_text_input(
    session: AgentSession, event: room_io.TextInputEvent
) -> None:
    logger.info(
        "received user text | participant=%s | topic=%s | text=%r",
        event.participant.identity,
        event.info.topic,
        event.text,
    )
    await session.interrupt()
    handle = session.generate_reply(user_input=event.text, input_modality="text")
    logger.info("dispatched generate_reply | handle_id=%s", getattr(handle, "id", None))


@server.rtc_session()
async def entrypoint(ctx: JobContext) -> None:
    session = AgentSession(
        llm=inference.LLM("openai/gpt-4.1-mini"),
    )
    await session.start(
        agent=ReVogueAssistant(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            text_input=room_io.TextInputOptions(text_input_cb=log_and_reply_text_input),
            text_output=True,
            audio_input=False,
            audio_output=False,
            close_on_disconnect=False,
        ),
    )
    await session.generate_reply(
        instructions="Greet the user and say you're the ReVogue style assistant. Ask how you can help."
    )


if __name__ == "__main__":
    cli.run_app(server)

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConnectionState, Room, RoomEvent } from "livekit-client";
import UserHeader from "../components/UserHeader";
import { CLASSES } from "../constants/theme";
import {
  useAppendMessageMutation,
  useCreateConversationMutation,
  useGetLivekitTokenMutation,
  useGetMessagesQuery,
  useListConversationsQuery,
} from "../store/api/agentChatApi";

const CHAT_TOPIC = "lk.chat";
const TRANSCRIPTION_TOPIC = "lk.transcription";

function formatTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const TYPEWRITER_TICK_MS = 18;
const TYPEWRITER_CHARS_PER_TICK = 2;

function AssistantChatPanel({ conversationId }) {
  const roomRef = useRef(null);
  const persistAssistantRef = useRef(async () => {});
  const audioUnlockedRef = useRef(false);
  const typewriterRef = useRef({
    timer: null,
    buffer: "",
    displayed: "",
    streamId: null,
    streamEnded: false,
  });
  const [input, setInput] = useState("");
  const [liveState, setLiveState] = useState(ConnectionState.Disconnected);
  const [liveError, setLiveError] = useState(null);
  const [streamingAssistant, setStreamingAssistant] = useState(null);

  const { data: messages = [], isLoading: messagesLoading } =
    useGetMessagesQuery(conversationId);
  const [appendMessage] = useAppendMessageMutation();
  const [fetchLivekitToken] = useGetLivekitTokenMutation();

  useEffect(() => {
    persistAssistantRef.current = async (text) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      try {
        await appendMessage({
          conversationId,
          role: "assistant",
          content: trimmed,
        }).unwrap();
      } catch (e) {
        console.error(e);
      }
    };
  }, [appendMessage, conversationId]);

  const ensureAudioPlaybackUnlocked = useCallback(async () => {
    if (audioUnlockedRef.current) return;
    const room = roomRef.current;
    if (!room) return;
    try {
      await room.startAudio();
      audioUnlockedRef.current = true;
    } catch {
      // Browser may still block until the next user gesture.
    }
  }, []);

  useEffect(() => {
    const room = new Room({ webAudioMix: false });
    roomRef.current = room;
    audioUnlockedRef.current = false;
    let cancelled = false;

    const onStateChange = (state) => {
      if (!cancelled) setLiveState(state);
    };

    room.on(RoomEvent.ConnectionStateChanged, onStateChange);

    const stopTypewriter = () => {
      const tw = typewriterRef.current;
      if (tw.timer) {
        clearInterval(tw.timer);
        tw.timer = null;
      }
    };

    const startTypewriter = (streamId) => {
      const tw = typewriterRef.current;
      stopTypewriter();
      tw.buffer = "";
      tw.displayed = "";
      tw.streamId = streamId;
      tw.streamEnded = false;

      tw.timer = setInterval(() => {
        if (cancelled) {
          stopTypewriter();
          return;
        }
        const remaining = tw.buffer.length - tw.displayed.length;
        if (remaining <= 0) {
          if (tw.streamEnded) {
            stopTypewriter();
            const finalText = tw.displayed;
            if (finalText.trim()) {
              void persistAssistantRef.current(finalText);
            }
            setStreamingAssistant(null);
          }
          return;
        }
        const take = Math.min(TYPEWRITER_CHARS_PER_TICK, remaining);
        tw.displayed = tw.buffer.slice(0, tw.displayed.length + take);
        setStreamingAssistant({
          id: tw.streamId,
          content: tw.displayed,
          phase: "typing",
        });
      }, TYPEWRITER_TICK_MS);
    };

    room.registerTextStreamHandler(TRANSCRIPTION_TOPIC, async (reader) => {
      const streamId = reader?.info?.id || `${Date.now()}`;
      const tw = typewriterRef.current;
      try {
        startTypewriter(streamId);
        if (!cancelled) {
          setStreamingAssistant({ id: streamId, content: "", phase: "typing" });
        }

        for await (const chunk of reader) {
          if (!chunk) continue;
          tw.buffer += chunk;
        }

        tw.streamEnded = true;
      } catch (err) {
        console.error(err);
        stopTypewriter();
        if (!cancelled) setStreamingAssistant(null);
      }
    });

    (async () => {
      try {
        setLiveError(null);
        const { url, token } = await fetchLivekitToken(conversationId).unwrap();
        if (cancelled) return;
        await room.connect(url, token, { autoSubscribe: false });
      } catch (err) {
        if (!cancelled) {
          setLiveError(
            err?.data?.message ||
              err?.message ||
              "Could not connect to LiveKit."
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      const tw = typewriterRef.current;
      if (tw.timer) {
        clearInterval(tw.timer);
        tw.timer = null;
      }
      room.off(RoomEvent.ConnectionStateChanged, onStateChange);
      room.disconnect();
      if (roomRef.current === room) roomRef.current = null;
      setStreamingAssistant(null);
    };
  }, [conversationId, fetchLivekitToken]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !roomRef.current) return;

    const room = roomRef.current;
    if (room.state !== ConnectionState.Connected) return;

    setInput("");
    setStreamingAssistant({
      id: `thinking-${Date.now()}`,
      content: "",
      phase: "thinking",
    });
    try {
      await ensureAudioPlaybackUnlocked();
      await appendMessage({
        conversationId,
        role: "user",
        content: text,
      }).unwrap();
      await room.localParticipant.sendText(text, { topic: CHAT_TOPIC });
    } catch (err) {
      console.error(err);
      setInput(text);
      setStreamingAssistant(null);
    }
  };

  const connected = liveState === ConnectionState.Connected;
  const canSend = connected && input.trim().length > 0;

  return (
    <>
      <div className="flex items-center justify-between mb-4 md:hidden">
        <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400">
          {connected ? "Live" : String(liveState)}
        </span>
      </div>

      {liveError && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded-sm">
          {liveError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto border border-stone-200 bg-white rounded-sm p-4 mb-4 min-h-[320px] max-h-[calc(100vh-280px)]">
        {messagesLoading && (
          <p className="text-sm text-stone-400">Loading messages…</p>
        )}
        {!messagesLoading && messages.length === 0 && (
          <p className="text-sm text-stone-400">
            No messages yet. Say hello below.
          </p>
        )}
        <ul className="space-y-4">
          {messages.map((m) => (
            <li
              key={m._id}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-sm px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    m.role === "user" ? "text-stone-400" : "text-stone-500"
                  }`}
                >
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </li>
          ))}
          {streamingAssistant && (
            <li
              key={`streaming-${streamingAssistant.id}`}
              className="flex justify-start"
            >
              <div className="max-w-[85%] rounded-sm px-3 py-2 text-sm bg-stone-100 text-stone-800">
                {streamingAssistant.phase === "thinking" ? (
                  <p className="flex items-center gap-1 text-stone-500 italic">
                    Thinking
                    <span className="thinking-dots" aria-hidden>
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </p>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap">
                      {streamingAssistant.content}
                      <span className="typewriter-caret" aria-hidden>
                        ▍
                      </span>
                    </p>
                    <p className="text-[10px] mt-1 text-stone-500">typing…</p>
                  </>
                )}
              </div>
            </li>
          )}
        </ul>
      </div>

      <form onSubmit={handleSend} className="flex gap-2 items-end">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
            void ensureAudioPlaybackUnlocked();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
          rows={2}
          placeholder={
            connected ? "Ask about styling, outfits…" : "Connecting…"
          }
          disabled={!connected}
          className="flex-1 border border-stone-300 rounded-sm px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-stone-400 disabled:bg-stone-100"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="text-[10px] uppercase tracking-[0.2em] bg-stone-900 text-white px-4 py-3 rounded-sm hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      <p className="text-[10px] text-stone-400 mt-2 hidden md:block">
        Connection: {connected ? "connected" : liveState}
      </p>
    </>
  );
}

export default function AssistantPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const { data: conversations = [], isLoading: listLoading } =
    useListConversationsQuery();
  const [createConversation, { isLoading: creating }] =
    useCreateConversationMutation();

  const handleNewChat = async () => {
    try {
      const conv = await createConversation().unwrap();
      navigate(`/assistant/${conv._id}`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <UserHeader />
      <div className={`${CLASSES.userWrapper} flex-1 flex flex-col md:flex-row min-h-0 py-6 gap-4`}>
        <aside className="w-full md:max-w-[280px] md:flex-shrink-0 md:border-r md:border-stone-200 md:pr-4 flex flex-col gap-3 max-h-40 md:max-h-none overflow-hidden md:overflow-visible">
          <div className="flex items-center justify-between gap-2">
            <h1
              className="text-[10px] uppercase tracking-[0.2em] text-stone-500"
              style={{ fontFamily: "'Tenor Sans', sans-serif" }}
            >
              Style assistant
            </h1>
            <button
              type="button"
              onClick={handleNewChat}
              disabled={creating}
              className="text-[9px] uppercase tracking-[0.15em] text-stone-600 hover:text-stone-900 border border-stone-300 px-2 py-1 rounded-sm disabled:opacity-50"
            >
              {creating ? "…" : "New chat"}
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto space-y-1 min-h-0">
            {listLoading && (
              <p className="text-xs text-stone-400">Loading…</p>
            )}
            {!listLoading &&
              conversations.map((c) => (
                <Link
                  key={c._id}
                  to={`/assistant/${c._id}`}
                  className={`block rounded-sm px-2 py-2 text-left text-sm border transition-colors ${
                    conversationId === c._id
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-700 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  <span className="line-clamp-2 block">{c.title || "Chat"}</span>
                  <span
                    className={`text-[10px] mt-0.5 block ${
                      conversationId === c._id ? "text-stone-300" : "text-stone-400"
                    }`}
                  >
                    {formatTime(c.updatedAt)}
                  </span>
                </Link>
              ))}
          </nav>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 md:pl-2 min-h-0">
          {!conversationId && (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <p className="text-stone-600 mb-4 max-w-md">
                Chat with the ReVogue style assistant. Conversations are saved so
                you can pick up later.
              </p>
              <button
                type="button"
                onClick={handleNewChat}
                disabled={creating}
                className="text-[10px] uppercase tracking-[0.2em] bg-stone-900 text-white px-6 py-3 rounded-sm hover:bg-stone-800 disabled:opacity-50"
              >
                {creating ? "Starting…" : "Start a conversation"}
              </button>
              <Link
                to="/"
                className="mt-6 text-[10px] uppercase tracking-[0.2em] text-stone-500 hover:text-stone-800"
              >
                Back to home
              </Link>
            </div>
          )}

          {conversationId && (
            <AssistantChatPanel
              key={conversationId}
              conversationId={conversationId}
            />
          )}
        </main>
      </div>
    </div>
  );
}

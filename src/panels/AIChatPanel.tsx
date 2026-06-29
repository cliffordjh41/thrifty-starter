import { useRef, useEffect, useMemo, useState } from "react"
import {
  Button,
  SlidingPanels,
  SlidingPanel,
  useChat,
  usePanelChrome,
  cx,
  type Message,
  type PanelProps,
} from "thrifty-ui"
import { MessageCircle, ArrowUp, Trash2, Settings, Download, ChevronLeft } from "lucide-react"

// A chat panel that shows off the OTHER end of the chrome contract: its input
// row is declared as a footer and HOISTED into the host's footer slot via
// usePanelChrome (the right column supplies an onFooter setter). Mount it in a
// bare host with no onFooter and the same footer renders inline instead — same
// component, no per-host code.
//
// No model is wired. The kit's useChat() replays its own canned replies (with a
// typewriter effect) so the starter runs offline. To make it real, replace the
// useChat() send path with a call to your backend; the UI here stays the same.

function MessageBubble({
  message,
  isTypingMessage,
  displayedContent,
}: {
  message: Message
  isTypingMessage?: boolean
  displayedContent?: string
}) {
  const isUser = message.role === "user"
  const content = isTypingMessage ? displayedContent : message.content

  return (
    <div className={cx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[85%] px-3 py-2 rounded-lg text-sm whitespace-pre-wrap",
          isUser ? "bg-action text-action-fg" : "bg-mute text-mute-fg",
        )}
      >
        {content}
        {isTypingMessage && (
          <span className="inline-block w-0.5 h-3.5 bg-foreground/60 ml-0.5 animate-pulse align-text-bottom" />
        )}
      </div>
    </div>
  )
}

export function AIChatPanel({ onFooter, onData }: PanelProps) {
  const chat = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [panelIndex, setPanelIndex] = useState(0)

  // Auto-scroll to bottom on new messages or typing updates.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chat.messages, chat.displayedContent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const userMessage = chat.inputValue.trim()
    chat.sendMessage()
    if (userMessage) {
      onData?.({ role: "user", content: userMessage, timestamp: Date.now() })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      chat.sendMessage()
    }
  }

  const handleExport = () => {
    const transcript = chat.messages.map((m) => ({
      role: m.role,
      content: m.content,
      time: new Date(m.timestamp).toISOString(),
    }))
    const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const isEmpty = chat.messages.length === 0 && !chat.isTyping
  const messagesArea = (
    <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
      {isEmpty ? (
        <div className="min-h-full flex flex-col items-center justify-center text-center px-4">
          <MessageCircle className="size-8 text-mute-fg/40 mb-2" />
          <p className="text-xs text-mute-fg">Start a conversation</p>
        </div>
      ) : (
        <div className="px-4 py-3 space-y-3">
          {chat.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {chat.isTyping && chat.displayedContent && (
            <MessageBubble
              message={{
                id: "typing",
                role: "assistant",
                content: chat.displayedContent,
                timestamp: Date.now(),
              }}
              isTypingMessage
              displayedContent={chat.displayedContent}
            />
          )}

          {chat.isTyping && !chat.displayedContent && (
            <div className="flex justify-start">
              <div className="bg-mute px-3 py-2 rounded-lg">
                <div className="flex gap-1">
                  <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:0ms]" />
                  <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:150ms]" />
                  <span className="size-1.5 rounded-full bg-foreground/40 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const footer = useMemo(
    () => (
      <>
        <form onSubmit={handleSubmit} className="flex-1 px-3 flex items-center gap-2">
          <input
            type="text"
            value={chat.inputValue}
            onChange={(e) => chat.setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={chat.isTyping}
            enterKeyHint="send"
            className="flex-1 bg-transparent text-[11px] text-foreground placeholder:text-mute-fg/40 outline-none disabled:opacity-50"
          />
          <Button
            type="submit"
            aria-label="Send message"
            variant="ghost"
            size="icon"
            className="size-7 shrink-0"
            disabled={!chat.inputValue.trim() || chat.isTyping}
          >
            <ArrowUp className="size-3" />
          </Button>
        </form>
        <button
          onClick={() => setPanelIndex(panelIndex === 1 ? 0 : 1)}
          aria-label={panelIndex === 1 ? "Back to chat" : "Open settings"}
          className={cx(
            "px-3 border-l border-line transition-colors flex items-center justify-center",
            panelIndex === 1
              ? "bg-foreground text-background"
              : "text-mute-fg hover:text-foreground hover:bg-mute/50",
          )}
        >
          {panelIndex === 1 ? <ChevronLeft className="size-3.5" /> : <Settings className="size-3.5" />}
        </button>
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chat.inputValue, chat.isTyping, panelIndex],
  )

  const { footer: footerEl } = usePanelChrome({ onFooter, footer })

  const settingsBody = (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-(--theme-font-weight) text-mute-fg uppercase tracking-(--theme-letter-spacing)">
          Data
        </label>
        <button
          className={cx(
            "w-full py-1.5 px-2 text-[10px] font-(--theme-font-weight) rounded-lg border border-line text-mute-fg hover:border-action/50 transition-all flex items-center gap-1.5",
            chat.messages.length === 0 && "opacity-50 pointer-events-none",
          )}
          onClick={handleExport}
          disabled={chat.messages.length === 0}
        >
          <Download className="size-3" />
          Export Transcript
        </button>
        <p className="text-[9px] text-mute-fg text-center">
          {chat.messages.length} message{chat.messages.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-(--theme-font-weight) text-mute-fg uppercase tracking-(--theme-letter-spacing)">
          Chat
        </label>
        <button
          className={cx(
            "w-full py-1.5 px-2 text-[10px] font-(--theme-font-weight) rounded-lg border border-line text-mute-fg hover:border-alert hover:text-alert transition-all flex items-center gap-1.5",
            chat.messages.length === 0 && "opacity-50 pointer-events-none",
          )}
          onClick={chat.clearMessages}
          disabled={chat.messages.length === 0}
        >
          <Trash2 className="size-3" />
          Clear Messages
        </button>
      </div>
    </div>
  )

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <SlidingPanels activeIndex={panelIndex} onIndexChange={setPanelIndex} className="flex-1 min-h-0">
        <SlidingPanel>{messagesArea}</SlidingPanel>
        <SlidingPanel>
          <div className="shrink-0 h-11 px-4 border-b border-line flex items-center">
            <span className="text-[10px] font-(--theme-font-weight) uppercase tracking-(--theme-letter-spacing) text-mute-fg">
              Settings
            </span>
          </div>
          {settingsBody}
        </SlidingPanel>
      </SlidingPanels>
      {footerEl}
    </div>
  )
}

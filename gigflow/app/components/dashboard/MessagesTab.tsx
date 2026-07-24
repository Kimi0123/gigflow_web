"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../providers/AuthContext";
import { useSocket } from "../../providers/SocketContext";
import type { Contract } from "../../lib/api/contractApi";
import { type Message, messageApi } from "../../lib/api/messageApi";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MessagesTabProps {
  role: "client" | "freelancer";
  contracts: Contract[];
  onToast: (type: "success" | "error", message: string) => void;
}

// ─── Status badge config ──────────────────────────────────────────────────────
const statusConfig: Record<string, { color: string; bg: string }> = {
  active: { color: "#0369a1", bg: "#e0f7ff" },
  completed: { color: "#166534", bg: "#dcfce7" },
  cancelled: { color: "#991b1b", bg: "#fee2e2" },
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function MessagesTab({
  role,
  contracts,
  onToast,
}: MessagesTabProps) {
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [unreadByContract, setUnreadByContract] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const joinedRooms = useRef<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const myId = user?.id || (user as any)?._id;

  // Derive "other party" name from contract
  const getOtherPartyName = (contract: Contract) =>
    role === "client" ? contract.freelancerName : contract.clientName;

  const getOtherPartyInitials = (contract: Contract) =>
    role === "client"
      ? contract.freelancerInitials || contract.freelancerName?.slice(0, 2).toUpperCase() || "??"
      : contract.clientInitials || contract.clientName?.slice(0, 2).toUpperCase() || "??";

  // ─── Auto-scroll on new messages ─────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Fetch history when contract selected ────────────────────────────────
  const fetchMessages = useCallback(
    async (contractId: string) => {
      if (!token) return;
      setLoadingMessages(true);
      try {
        const res = await messageApi.getContractMessages(token, contractId);
        setMessages(res.messages);
      } catch {
        onToast("error", "Failed to load messages.");
      } finally {
        setLoadingMessages(false);
      }
    },
    [token, onToast]
  );

  // Mark read and refetch when changing conversation
  const handleSelectContract = useCallback(
    async (contract: Contract) => {
      setSelectedContract(contract);
      setMessages([]);
      setInputValue("");
      await fetchMessages(contract.id);
      // Mark read
      if (token) {
        try {
          await messageApi.markMessagesRead(token, contract.id);
          setUnreadByContract((prev) => ({ ...prev, [contract.id]: 0 }));
        } catch {
          // non-critical
        }
      }
    },
    [token, fetchMessages]
  );

  // ─── Socket: join room when connected ────────────────────────────────────
  useEffect(() => {
    if (!socket || !isConnected || !selectedContract) return;
    const room = selectedContract.id;
    if (joinedRooms.current.has(room)) return;

    socket.emit("join_contract", { contractId: room }, (ack: { ok: boolean; error?: string }) => {
      if (ack?.ok) {
        joinedRooms.current.add(room);
      }
    });
  }, [socket, isConnected, selectedContract]);

  // Also rejoin rooms for all contracts (to track unread counts from background messages)
  useEffect(() => {
    if (!socket || !isConnected) return;
    contracts.forEach((c) => {
      if (joinedRooms.current.has(c.id)) return;
      socket.emit("join_contract", { contractId: c.id }, (ack: { ok: boolean; error?: string }) => {
        if (ack?.ok) joinedRooms.current.add(c.id);
      });
    });
  }, [socket, isConnected, contracts]);

  // ─── Socket: listen for new_message ──────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      if (selectedContract && msg.contractId === selectedContract.id) {
        setMessages((prev) => {
          // Deduplicate by id
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        // Auto-mark read since conversation is open
        if (token && msg.senderId !== myId) {
          messageApi.markMessagesRead(token, msg.contractId).catch(() => null);
        }
      } else if (msg.senderId !== myId) {
        // Track unread for a different contract
        setUnreadByContract((prev) => ({
          ...prev,
          [msg.contractId]: (prev[msg.contractId] || 0) + 1,
        }));
      }
    };

    const handleSocketError = (err: { message: string }) => {
      onToast("error", err.message || "Socket error");
    };

    socket.on("new_message", handleNewMessage);
    socket.on("error", handleSocketError);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("error", handleSocketError);
    };
  }, [socket, selectedContract, myId, token, onToast]);

  // Reset joined rooms when socket disconnects
  useEffect(() => {
    if (!isConnected) {
      joinedRooms.current.clear();
    }
  }, [isConnected]);

  // ─── Send message ─────────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || !selectedContract || sending) return;

    setSending(true);
    setInputValue("");

    try {
      if (isConnected && socket) {
        // Send via socket — the server broadcasts back to everyone in the room including sender
        socket.emit("send_message", {
          contractId: selectedContract.id,
          content,
        });
      } else {
        // REST fallback
        if (!token) return;
        const msg = await messageApi.sendMessageRest(token, selectedContract.id, content);
        setMessages((prev) => [...prev, msg]);
      }
    } catch {
      onToast("error", "Failed to send message.");
      setInputValue(content); // restore
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e9eef5] bg-white py-20 text-center shadow-sm">
        <ChatBubbleIcon className="mx-auto mb-4 h-12 w-12 text-[#cbd5e1]" />
        <p className="text-[15px] font-semibold text-[#94a3b8]">No conversations yet</p>
        <p className="mt-1.5 text-[13px] text-[#70829d]">
          Messages appear here once you have an active contract.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[500px] overflow-hidden rounded-2xl border border-[#e9eef5] bg-white shadow-sm">
      {/* ── Left panel: conversation list ── */}
      <div className="flex w-[300px] shrink-0 flex-col border-r border-[#e9eef5]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e9eef5] px-4 py-4">
          <div>
            <h2 className="text-[16px] font-extrabold text-[#111d31]">Messages</h2>
            <p className="text-[11px] text-[#70829d]">{contracts.length} conversation{contracts.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: isConnected ? "#22c55e" : "#94a3b8" }}
              title={isConnected ? "Real-time connected" : "Offline – using REST fallback"}
            />
            <span className="text-[10px] font-semibold text-[#94a3b8]">
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {contracts.map((contract) => {
            const isSelected = selectedContract?.id === contract.id;
            const unread = unreadByContract[contract.id] || 0;
            const sc = statusConfig[contract.status] ?? statusConfig.active;
            return (
              <button
                key={contract.id}
                type="button"
                onClick={() => void handleSelectContract(contract)}
                className={`w-full border-b border-[#f1f5f9] px-4 py-3.5 text-left transition ${
                  isSelected ? "bg-[#f0f8ff]" : "hover:bg-[#f7f8fa]"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white"
                    style={{ background: isSelected ? "#38bdf8" : "#64748b" }}
                  >
                    {getOtherPartyInitials(contract)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[13px] font-bold text-[#111d31]">
                        {getOtherPartyName(contract)}
                      </p>
                      {unread > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#38bdf8] px-1.5 text-[10px] font-bold text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-[#70829d]">
                      {contract.jobTitle}
                    </p>
                    <span
                      className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: sc.color, background: sc.bg }}
                    >
                      {contract.status}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right panel: message view ── */}
      <div className="flex flex-1 flex-col min-w-0">
        {!selectedContract ? (
          // Empty state — no conversation selected
          <div className="flex flex-1 flex-col items-center justify-center text-center p-8">
            <ChatBubbleIcon className="mb-4 h-10 w-10 text-[#cbd5e1]" />
            <p className="text-[14px] font-semibold text-[#94a3b8]">Select a conversation</p>
            <p className="mt-1 text-[12px] text-[#70829d]">
              Choose a contract from the left to start messaging.
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-[#e9eef5] px-5 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#38bdf8] text-[11px] font-black text-white">
                {getOtherPartyInitials(selectedContract)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-extrabold text-[#111d31]">
                  {getOtherPartyName(selectedContract)}
                </p>
                <p className="truncate text-[11px] text-[#70829d]">
                  {selectedContract.jobTitle} · Rs. {selectedContract.agreedAmount.toLocaleString()}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  color: statusConfig[selectedContract.status]?.color ?? "#0369a1",
                  background: statusConfig[selectedContract.status]?.bg ?? "#e0f7ff",
                }}
              >
                {selectedContract.status}
              </span>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loadingMessages ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                    >
                      <div className="h-10 w-48 animate-pulse rounded-2xl bg-[#f1f5f9]" />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-10">
                  <ChatBubbleIcon className="mb-3 h-8 w-8 text-[#cbd5e1]" />
                  <p className="text-[13px] font-semibold text-[#94a3b8]">No messages yet</p>
                  <p className="mt-1 text-[12px] text-[#70829d]">
                    Send the first message to get started.
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isMine = msg.senderId === myId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* Avatar */}
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full text-[9px] font-black text-white"
                          style={{ background: isMine ? "#38bdf8" : "#64748b" }}
                        >
                          {msg.senderInitials}
                        </div>

                        {/* Bubble */}
                        <div
                          className={`group max-w-[70%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                            isMine
                              ? "rounded-br-sm bg-[#38bdf8] text-white"
                              : "rounded-bl-sm bg-[#f1f5f9] text-[#111d31]"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p
                            className={`mt-1 text-right text-[10px] ${
                              isMine ? "text-white/70" : "text-[#94a3b8]"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {isMine && (
                              <span className="ml-1">
                                {msg.readAt ? " ✓✓" : " ✓"}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input bar */}
            <div className="border-t border-[#e9eef5] px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-[#dce5ef] bg-[#f7f8fa] px-3 py-2 transition focus-within:border-[#38bdf8] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#38bdf8]/20">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message…"
                  maxLength={2000}
                  className="flex-1 bg-transparent text-[13px] text-[#111d31] outline-none placeholder:text-[#9ca3af]"
                />
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!inputValue.trim() || sending}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#38bdf8] text-white transition hover:bg-[#0ea5e9] disabled:opacity-50"
                  title="Send message"
                >
                  {sending ? (
                    <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <SendIcon className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-right text-[10px] text-[#94a3b8]">
                {isConnected ? "Real-time" : "REST fallback"} · Enter to send
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" strokeLinecap="round" />
    </svg>
  );
}

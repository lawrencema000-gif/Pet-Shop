"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageCircle, Send, X, RefreshCw } from "lucide-react";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble";
import { ChatInput } from "@/components/ui/chat-input";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { ShadcnButton } from "@/components/ui/shadcn-button";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-provider";
import { cn } from "@/lib/utils";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";

interface Conversation {
  id: string;
  customer_id: string | null;
  customer_email: string | null;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string | null;
  sender_role: "customer" | "admin";
  message: string;
  created_at: string;
}

export default function AdminChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isSuperAdmin, hasPermission } = useStaffPermissions();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setConversations(data as Conversation[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Subscribe to new conversations
  useEffect(() => {
    const channel = supabase
      .channel("admin-conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (convoId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
    } else {
      setMessages([]);
    }
  }, [selectedId, loadMessages]);

  // Subscribe to new messages for selected conversation
  useEffect(() => {
    if (!selectedId) return;

    const channel = supabase
      .channel(`admin-chat-${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${selectedId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId]);

  const sendReply = async () => {
    if (!input.trim() || !selectedId || !user || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);

    const { data } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: selectedId,
        user_id: user.id,
        sender_role: "admin",
        message: text,
      })
      .select("*")
      .single();

    if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data as ChatMessage];
      });
    }

    // Bump updated_at
    await supabase
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", selectedId);

    setSending(false);
    inputRef.current?.focus();
  };

  const closeConversation = async (convoId: string) => {
    await supabase
      .from("chat_conversations")
      .update({ status: "closed" })
      .eq("id", convoId);
    fetchConversations();
    if (selectedId === convoId) {
      setSelectedId(null);
    }
  };

  const reopenConversation = async (convoId: string) => {
    await supabase
      .from("chat_conversations")
      .update({ status: "open" })
      .eq("id", convoId);
    fetchConversations();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const selectedConvo = conversations.find((c) => c.id === selectedId);

  // Get last message preview for each conversation
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadPreviews() {
      const convoIds = conversations.map((c) => c.id);
      if (convoIds.length === 0) return;

      // Batch fetch last message for all conversations in one query
      const { data } = await supabase
        .from("chat_messages")
        .select("conversation_id, message, sender_role, created_at")
        .in("conversation_id", convoIds)
        .order("created_at", { ascending: false });

      if (!data) return;

      // Group by conversation, take first (most recent) per conversation
      const newPreviews: Record<string, string> = {};
      const seen = new Set<string>();
      for (const msg of data) {
        if (seen.has(msg.conversation_id)) continue;
        seen.add(msg.conversation_id);
        const prefix = msg.sender_role === "admin" ? "You: " : "";
        newPreviews[msg.conversation_id] = prefix + (msg.message.length > 50 ? msg.message.slice(0, 50) + "..." : msg.message);
      }
      setPreviews(newPreviews);
    }
    loadPreviews();
  }, [conversations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!isSuperAdmin && !hasPermission("chat:read")) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted">You don&apos;t have permission to access chat.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Customer Chat
          </h1>
          <p className="text-sm text-muted mt-1">
            Manage and reply to customer support conversations
          </p>
        </div>
        <ShadcnButton variant="outline" size="sm" onClick={fetchConversations}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </ShadcnButton>
      </div>

      <div className="flex bg-white rounded-lg border border-border overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: 500 }}>
        {/* Left Panel - Conversation List */}
        <div className="w-80 border-r border-border flex flex-col shrink-0">
          <div className="p-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Conversations ({conversations.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted px-4">
                <MessageCircle className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm text-center">No conversations yet</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => setSelectedId(convo.id)}
                  className={cn(
                    "w-full text-left p-3 border-b border-border/50 hover:bg-surface/50 transition-colors",
                    selectedId === convo.id && "bg-surface"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {convo.customer_email || "Anonymous"}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                        convo.status === "open"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {convo.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted truncate">
                    {previews[convo.id] || "No messages yet"}
                  </p>
                  <p className="text-[10px] text-muted/70 mt-1">
                    {new Date(convo.updated_at).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Messages */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConvo ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedConvo.customer_email || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted">
                    Started {new Date(selectedConvo.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedConvo.status === "open" ? (
                    <ShadcnButton
                      variant="outline"
                      size="sm"
                      onClick={() => closeConversation(selectedConvo.id)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Close
                    </ShadcnButton>
                  ) : (
                    <ShadcnButton
                      variant="outline"
                      size="sm"
                      onClick={() => reopenConversation(selectedConvo.id)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reopen
                    </ShadcnButton>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <ChatMessageList smooth className="h-full">
                  {messages.map((msg) => (
                    <ChatBubble
                      key={msg.id}
                      variant={msg.sender_role === "admin" ? "sent" : "received"}
                    >
                      {msg.sender_role === "customer" && (
                        <ChatBubbleAvatar fallback="C" />
                      )}
                      <ChatBubbleMessage
                        variant={msg.sender_role === "admin" ? "sent" : "received"}
                      >
                        {msg.message}
                      </ChatBubbleMessage>
                      {msg.sender_role === "admin" && (
                        <ChatBubbleAvatar fallback="A" />
                      )}
                    </ChatBubble>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-sm text-muted text-center py-8">
                      No messages in this conversation yet.
                    </p>
                  )}
                </ChatMessageList>
              </div>

              {/* Reply input */}
              {selectedConvo.status === "open" && (
                <div className="border-t border-border p-4">
                  <form
                    className="flex items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendReply();
                    }}
                  >
                    <ChatInput
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a reply..."
                      disabled={sending}
                    />
                    <ShadcnButton
                      type="submit"
                      size="icon"
                      variant="default"
                      disabled={!input.trim() || sending}
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </ShadcnButton>
                  </form>
                </div>
              )}

              {selectedConvo.status === "closed" && (
                <div className="border-t border-border p-4 text-center">
                  <p className="text-sm text-muted">
                    This conversation is closed.{" "}
                    <button
                      className="text-accent underline"
                      onClick={() => reopenConversation(selectedConvo.id)}
                    >
                      Reopen it
                    </button>
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

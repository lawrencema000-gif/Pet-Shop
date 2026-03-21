"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageCircle, CornerDownLeft } from "lucide-react";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat";
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

interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string | null;
  sender_role: "customer" | "admin";
  message: string;
  created_at: string;
}

export function LiveChatWidget() {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load or create conversation when widget first opens
  const initConversation = useCallback(async () => {
    if (!user || initialized) return;

    // Try to find an existing open conversation
    const { data: existing } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("customer_id", user.id)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      setConversationId(existing.id);
      // Load messages
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", existing.id)
        .order("created_at", { ascending: true });
      if (msgs) setMessages(msgs as ChatMessage[]);
    } else {
      // Create new conversation
      const { data: newConvo } = await supabase
        .from("chat_conversations")
        .insert({
          customer_id: user.id,
          customer_email: user.email ?? "",
          status: "open",
        })
        .select("id")
        .single();

      if (newConvo) {
        setConversationId(newConvo.id);
        setMessages([]);
      }
    }

    setInitialized(true);
  }, [user, initialized]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || !user || sending) return;

    const text = input.trim();
    setInput("");
    setSending(true);

    const { data } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        sender_role: "customer",
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

    // Also bump the conversation updated_at
    await supabase
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <ExpandableChat
      size="md"
      position="bottom-right"
      icon={
        <div className="relative">
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        </div>
      }
    >
      <ExpandableChatHeader className="bg-accent text-white">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-accent" />
          </div>
          <div>
            <p className="font-semibold text-sm">PETLIBRO Support</p>
            <p className="text-xs text-white/70">We typically reply in a few minutes</p>
          </div>
        </div>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList
          smooth
          className="min-h-0"
        >
          {/* Welcome message */}
          <ChatBubble variant="received">
            <ChatBubbleAvatar fallback="PL" />
            <ChatBubbleMessage variant="received">
              Hi! How can we help you today?
            </ChatBubbleMessage>
          </ChatBubble>

          {!user && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar fallback="PL" />
              <ChatBubbleMessage variant="received">
                Please sign in to start a conversation.
              </ChatBubbleMessage>
            </ChatBubble>
          )}

          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              variant={msg.sender_role === "customer" ? "sent" : "received"}
            >
              {msg.sender_role === "admin" && (
                <ChatBubbleAvatar fallback="PL" />
              )}
              <ChatBubbleMessage
                variant={msg.sender_role === "customer" ? "sent" : "received"}
              >
                {msg.message}
              </ChatBubbleMessage>
              {msg.sender_role === "customer" && (
                <ChatBubbleAvatar fallback="You" />
              )}
            </ChatBubble>
          ))}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        {user ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!initialized) initConversation().then(() => sendMessage());
              else sendMessage();
            }}
          >
            <ChatInput
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (!initialized) initConversation();
              }}
              placeholder="Type a message..."
              disabled={sending}
            />
            <ShadcnButton
              type="submit"
              size="icon"
              variant="default"
              disabled={!input.trim() || sending}
              className="shrink-0"
            >
              <CornerDownLeft className="h-4 w-4" />
            </ShadcnButton>
          </form>
        ) : (
          <p className="text-sm text-muted text-center py-2">
            <a href="/auth/login" className="text-accent underline">Sign in</a> to chat with us
          </p>
        )}
      </ExpandableChatFooter>
    </ExpandableChat>
  );
}

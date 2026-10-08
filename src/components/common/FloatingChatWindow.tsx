import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatConversation } from '../../types';
import { UserAvatar } from './UserAvatar';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

interface FloatingChatWindowProps {
  conversation: ChatConversation | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (convId: string, text: string) => void;
  onOpenFullScreen?: () => void;
}

export const FloatingChatWindow: React.FC<FloatingChatWindowProps> = ({
  conversation,
  isOpen,
  onClose,
  onSendMessage,
  onOpenFullScreen,
}) => {
  const { language } = useThemeLanguage();
  const isEn = language === 'en';

  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized, conversation?.messages?.length]);

  if (!isOpen || !conversation) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(conversation.id, inputText.trim());
    setInputText('');
  };

  const messages = conversation.messages || [];

  return (
    <AnimatePresence>
      <motion.div
        id="floating-chat-window"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-96 bg-white dark:bg-[#0e241c] rounded-2xl shadow-2xl border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 overflow-hidden flex flex-col font-sans"
        style={{ height: isMinimized ? 'auto' : '500px', maxHeight: '82vh' }}
      >
        {/* Chat Header */}
        <div className="bg-[#012d1d] text-white px-4 py-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <UserAvatar
                src={conversation.participantAvatar}
                name={conversation.participantName}
                size="sm"
                borderClassName="border border-[#b0f1cc]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#4ade80] border-2 border-[#012d1d] rounded-full"></span>
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs truncate text-[#faf9f4]">
                {conversation.participantName}
              </h4>
              <p className="text-[10px] text-[#b0f1cc] truncate">
                {conversation.participantRole || (isEn ? 'Tailor / Designer' : 'Costurero / Modista')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onOpenFullScreen && (
              <button
                type="button"
                onClick={onOpenFullScreen}
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isEn ? 'Open full screen messages' : 'Abrir en pantalla completa de mensajes'}
              >
                <span className="material-symbols-outlined text-base">open_in_full</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isMinimized ? (isEn ? 'Expand chat' : 'Expandir chat') : (isEn ? 'Minimize chat' : 'Minimizar chat')}
            >
              <span className="material-symbols-outlined text-base">
                {isMinimized ? 'expand_less' : 'remove'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isEn ? 'Close chat' : 'Cerrar chat'}
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Chat Body (hidden when minimized) */}
        {!isMinimized && (
          <>
            <div className="flex-1 p-4 overflow-y-auto bg-[#faf9f4] dark:bg-[#001b10] space-y-3">
              {/* If no messages: Empty State (Requirement 8) */}
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#e8f5ed] dark:bg-[#002113] text-[#2b694d] dark:text-[#b0f1cc] flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">chat</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#012d1d] dark:text-white">
                      {isEn ? `Conversation with ${conversation.participantName}` : `Conversación con ${conversation.participantName}`}
                    </h5>
                    <p className="text-[11px] text-[#717973] dark:text-[#a0a5a1] mt-1 leading-relaxed">
                      {isEn ? 'The chat is ready. Type your first message below to ask about availability, prices, or alterations.' : 'El chat está listo. Escribe tu primer mensaje abajo para consultar disponibilidad, precios o ajustes.'}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#012d1d] text-white rounded-br-xs'
                            : 'bg-white dark:bg-[#0e241c] text-[#1b1c19] dark:text-white border border-[#efeee9] dark:border-[#2b694d]/30 rounded-bl-xs'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span
                          className={`text-[9px] block mt-1 text-right ${
                            isUser ? 'text-[#b0f1cc]/80' : 'text-[#717973] dark:text-[#a0a5a1]'
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white dark:bg-[#0e241c] border-t border-[#efeee9] dark:border-[#2b694d]/30 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isEn ? 'Type a message...' : 'Escribe un mensaje...'}
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[#f5f4ef] dark:bg-[#002113]/50 border border-[#c1c8c2]/50 dark:border-[#2b694d]/40 text-[#1b1c19] dark:text-white focus:outline-none focus:border-[#012d1d] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-[#012d1d] text-white hover:bg-[#2b694d] disabled:opacity-40 disabled:hover:bg-[#012d1d] transition-all cursor-pointer flex items-center justify-center shrink-0"
                title={isEn ? 'Send message' : 'Enviar mensaje'}
              >
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </form>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatConversation } from '../../types';
import { UserAvatar } from './UserAvatar';

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
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#c1c8c2]/50 overflow-hidden flex flex-col font-sans"
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
                {conversation.participantRole || 'Costurero / Modista'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onOpenFullScreen && (
              <button
                type="button"
                onClick={onOpenFullScreen}
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Abrir en pantalla completa de mensajes"
              >
                <span className="material-symbols-outlined text-base">open_in_full</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title={isMinimized ? 'Expandir chat' : 'Minimizar chat'}
            >
              <span className="material-symbols-outlined text-base">
                {isMinimized ? 'expand_less' : 'remove'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar chat"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Chat Body (hidden when minimized) */}
        {!isMinimized && (
          <>
            <div className="flex-1 p-4 overflow-y-auto bg-[#faf9f4] space-y-3">
              {/* If no messages: Empty State (Requirement 8) */}
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#e8f5ed] text-[#2b694d] flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">chat</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#012d1d]">
                      Conversación con {conversation.participantName}
                    </h5>
                    <p className="text-[11px] text-[#717973] mt-1 leading-relaxed">
                      El chat está listo. Escribe tu primer mensaje abajo para consultar disponibilidad, precios o ajustes.
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
                            : 'bg-white text-[#1b1c19] border border-[#efeee9] rounded-bl-xs'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span
                          className={`text-[9px] block mt-1 text-right ${
                            isUser ? 'text-[#b0f1cc]/80' : 'text-[#717973]'
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
              className="p-3 bg-white border-t border-[#efeee9] flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[#f5f4ef] border border-[#c1c8c2]/50 text-[#1b1c19] focus:outline-none focus:border-[#012d1d] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-[#012d1d] text-white hover:bg-[#2b694d] disabled:opacity-40 disabled:hover:bg-[#012d1d] transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Enviar mensaje"
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

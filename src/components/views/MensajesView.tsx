import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatConversation, AppView } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface MensajesViewProps {
  conversations: ChatConversation[];
  activeConvId: string;
  onSelectConversation: (id: string) => void;
  onSendMessage: (convId: string, text: string) => void;
  onNavigate: (view: AppView) => void;
}

export const MensajesView: React.FC<MensajesViewProps> = ({
  conversations,
  activeConvId,
  onSelectConversation,
  onSendMessage,
  onNavigate,
}) => {
  const [inputText, setInputText] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  // Scroll ONLY inside the chat messages container, NEVER scrolling the outer browser page
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (activeConv) {
      scrollToBottom();
    }
  }, [activeConv?.id, activeConv?.messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputText.trim());
    setInputText('');
    setTimeout(scrollToBottom, 50);
  };

  const handleSelectConv = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onSelectConversation(id);
    setShowMobileChat(true);
  };

  // Requirement: If user has no conversations, display completely clean empty state
  if (!conversations || conversations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20"
      >
        <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 text-center border border-[#efeee9] shadow-[0_4px_24px_rgba(1,45,29,0.05)] flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-[#f5fbf7] border border-[#b0f1cc]/80 flex items-center justify-center text-[#2b694d] mb-5 shadow-xs">
            <span className="material-symbols-outlined text-4xl">chat_bubble_outline</span>
          </div>
          <h2 className="font-headline font-bold text-2xl sm:text-3xl text-[#012d1d] mb-2.5">
            No tienes conversaciones todavía
          </h2>
          <p className="text-xs sm:text-sm text-[#717973] max-w-md leading-relaxed mb-8">
            Aquí aparecerán tus mensajes tan pronto inicies una conversación con un taller, modista o artesano para transformar o ajustar tus prendas.
          </p>
          <div className="flex flex-wrap gap-3.5 justify-center">
            <button
              type="button"
              onClick={() => onNavigate('explora')}
              className="px-6 py-3 rounded-full bg-[#012d1d] hover:bg-[#1b4332] text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-base">explore</span>
              <span>Explorar Costureros y Talleres</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('publicar')}
              className="px-6 py-3 rounded-full bg-[#f5f4ef] hover:bg-[#e9e8e3] text-[#012d1d] text-xs sm:text-sm font-bold transition-all border border-[#c1c8c2]/60 flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Publicar una Prenda</span>
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10"
    >
      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(1,45,29,0.06)] border border-[#efeee9] overflow-hidden flex flex-col md:flex-row h-[78vh] min-h-[540px]">
        {/* Left Side: Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-[#efeee9] flex flex-col bg-[#faf9f4] ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#efeee9] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-[#2b694d]">forum</span>
              <h2 className="font-headline font-bold text-base sm:text-lg text-[#012d1d]">
                Mensajes
              </h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#b0f1cc]/60 text-[#002113]">
              {conversations.length}
            </span>
          </div>

          {/* Conversations Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#efeee9]">
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              const lastMsg = conv.messages && conv.messages.length > 0
                ? conv.messages[conv.messages.length - 1]
                : null;

              return (
                <div
                  key={conv.id}
                  onClick={(e) => handleSelectConv(conv.id, e)}
                  className={`p-4 flex items-start gap-3 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#e8f5ed] border-l-4 border-[#2b694d]'
                      : 'hover:bg-white bg-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <UserAvatar
                      src={conv.participantAvatar}
                      name={conv.participantName}
                      size="md"
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ba1a1a] text-white text-[9px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-xs sm:text-sm font-bold text-[#012d1d] truncate">
                        {conv.participantName}
                      </h4>
                      <span className="text-[10px] text-[#717973] shrink-0 ml-1">
                        {conv.lastMessageTime || ''}
                      </span>
                    </div>
                    <p className="text-xs text-[#2b694d] font-medium truncate mb-0.5">
                      {conv.participantRole || 'Contacto'}
                    </p>
                    <p className="text-[11px] text-[#414844] truncate">
                      {lastMsg ? lastMsg.text : 'Conversación iniciada (sin mensajes aún)'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        {activeConv ? (
          <div
            className={`flex-1 flex flex-col bg-white ${
              !showMobileChat ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Chat Header */}
            <div className="p-3.5 sm:p-4 border-b border-[#efeee9] flex items-center justify-between bg-[#faf9f4]">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden p-1.5 -ml-1 text-[#012d1d] hover:bg-[#efeee9] rounded-lg transition-colors cursor-pointer"
                  aria-label="Volver a la lista de mensajes"
                >
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>

                <UserAvatar
                  src={activeConv.participantAvatar}
                  name={activeConv.participantName}
                  size="md"
                />
                <div className="min-w-0">
                  <h3 className="font-headline font-bold text-sm text-[#012d1d] truncate">
                    {activeConv.participantName}
                  </h3>
                  <p className="text-[11px] text-[#2b694d] flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-[#2b694d] shrink-0 animate-pulse"></span>
                    <span className="truncate">En línea • {activeConv.participantRole || 'Taller'}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('explora')}
                  className="text-xs font-semibold text-[#012d1d] hover:bg-[#efeee9] px-3 py-1.5 rounded-xl transition-colors border border-[#c1c8c2]/60 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm hidden sm:inline">explore</span>
                  <span>Explorar</span>
                </button>
              </div>
            </div>

            {/* Messages Stream */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fbfbfa]"
            >
              {activeConv.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#e8f5ed] text-[#2b694d] flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-3xl">chat_bubble</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-base text-[#012d1d]">
                      Conversación con {activeConv.participantName}
                    </h4>
                    <p className="text-xs text-[#717973] mt-1 max-w-sm leading-relaxed">
                      Esta conversación está lista. Escribe tu primer mensaje abajo para consultar presupuesto, disponibilidad o detalles sobre tus prendas.
                    </p>
                  </div>
                </div>
              ) : (
                activeConv.messages.map((msg) => {
                  const isMe = msg.sender === 'user';

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] md:max-w-[65%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isMe
                            ? 'bg-[#012d1d] text-white rounded-br-xs'
                            : 'bg-white text-[#1b1c19] border border-[#efeee9] rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      </div>
                      <span className="text-[10px] text-[#717973] mt-1 px-1">{msg.time}</span>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-3 sm:p-4 bg-white border-t border-[#efeee9] flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe un mensaje para coordinar la confección o medidas..."
                className="flex-1 bg-[#f5f4ef] border border-[#c1c8c2]/70 rounded-xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#1b1c19] outline-none focus:bg-white focus:border-[#012d1d] transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 sm:py-3 rounded-xl bg-[#012d1d] text-white font-bold text-xs sm:text-sm hover:bg-[#2b694d] disabled:opacity-40 disabled:hover:bg-[#012d1d] transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-98"
              >
                <span className="hidden sm:inline">Enviar</span>
                <span className="material-symbols-outlined text-base">send</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center p-8 text-center text-[#717973] bg-[#faf9f4]">
            <p className="text-sm">Selecciona una conversación de la lista para ver los mensajes.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { SupportTicket } from '../../types';

interface AdminSupportManagementProps {
  tickets: SupportTicket[];
  onReplyTicket: (ticketId: string, replyMessage: string) => void;
  onUpdateStatus: (ticketId: string, status: SupportTicket['status']) => void;
}

export const AdminSupportManagement: React.FC<AdminSupportManagementProps> = ({
  tickets,
  onReplyTicket,
  onUpdateStatus,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyInput, setReplyInput] = useState('');

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyInput.trim()) return;
    onReplyTicket(selectedTicket.id, replyInput);
    // update local state
    setSelectedTicket({
      ...selectedTicket,
      status: 'en_progreso',
      messages: [
        ...selectedTicket.messages,
        {
          id: `msg-${Date.now()}`,
          sender: 'admin',
          senderName: 'Administrador Reborn',
          message: replyInput.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
    });
    setReplyInput('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-[#012d1d] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#2b694d]">support_agent</span>
            <span>Bandeja de Soporte y Atención al Usuario</span>
          </h2>
          <p className="text-xs text-[#717973]">
            Atiende consultas, reclamos y solicitudes técnicas de la comunidad Reborn.
          </p>
        </div>

        <span className="text-xs font-bold text-[#012d1d] bg-[#b0f1cc]/40 border border-[#2b694d]/20 px-3 py-1.5 rounded-xl">
          {tickets.length} tickets registrados
        </span>
      </div>

      {/* Main Support Layout: Left Tickets List, Right Ticket Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="bg-white rounded-3xl p-4 border border-[#c1c8c2]/50 shadow-xs space-y-3 lg:col-span-1">
          <h3 className="font-headline font-bold text-sm text-[#012d1d] px-2">
            Tickets de la Comunidad
          </h3>

          <div className="divide-y divide-[#efeee9] max-h-[600px] overflow-y-auto">
            {tickets.map((t) => {
              const isSelected = selectedTicket?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all space-y-1.5 ${
                    isSelected ? 'bg-[#012d1d] text-white' : 'hover:bg-[#faf9f4] text-[#1b1c19]'
                  }`}
                >
                  <div className="flex justify-between items-start text-xs">
                    <span className="font-bold truncate">{t.userName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : t.status === 'resuelto'
                        ? 'bg-[#b0f1cc] text-[#002113]'
                        : t.status === 'en_progreso'
                        ? 'bg-[#ffdcc1] text-[#934b00]'
                        : 'bg-[#ffdad6] text-[#ba1a1a]'
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </div>

                  <p className={`text-xs line-clamp-1 ${isSelected ? 'text-white/90' : 'text-[#414844]'}`}>
                    {t.subject}
                  </p>

                  <div className={`flex justify-between text-[10px] ${isSelected ? 'text-white/60' : 'text-[#717973]'}`}>
                    <span>{t.category}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Ticket Conversation */}
        <div className="bg-white rounded-3xl p-6 border border-[#c1c8c2]/50 shadow-xs lg:col-span-2 flex flex-col justify-between min-h-[500px]">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between space-y-4">
              <div>
                {/* Ticket Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efeee9] pb-4">
                  <div>
                    <h3 className="font-headline font-bold text-base text-[#012d1d]">
                      {selectedTicket.subject}
                    </h3>
                    <p className="text-xs text-[#717973]">
                      De: {selectedTicket.userName} ({selectedTicket.userEmail}) • Prioridad: {selectedTicket.priority}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as any;
                        onUpdateStatus(selectedTicket.id, newStatus);
                        setSelectedTicket({ ...selectedTicket, status: newStatus });
                      }}
                      className="bg-[#faf9f4] border border-[#c1c8c2] rounded-xl px-3 py-1 text-xs text-[#012d1d] font-bold"
                    >
                      <option value="abierto">Abierto</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="resuelto">Resuelto</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="space-y-3 py-4 max-h-[360px] overflow-y-auto">
                  {selectedTicket.messages.map((m) => {
                    const isAdmin = m.sender === 'admin';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-[80%] ${
                          isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <span className="text-[10px] text-[#717973] mb-1 font-semibold">
                          {m.senderName}
                        </span>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isAdmin
                              ? 'bg-[#012d1d] text-white rounded-br-none'
                              : 'bg-[#f5f4ef] text-[#1b1c19] rounded-bl-none'
                          }`}
                        >
                          {m.message}
                        </div>
                        <span className="text-[9px] text-[#717973] mt-0.5">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-[#efeee9] flex gap-2">
                <input
                  type="text"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Escribir respuesta oficial de soporte..."
                  className="flex-1 bg-[#faf9f4] border border-[#c1c8c2] rounded-xl px-4 py-2.5 text-xs text-[#012d1d] outline-none focus:bg-white focus:border-[#012d1d]"
                />
                <button
                  type="submit"
                  disabled={!replyInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#012d1d] text-white text-xs font-bold hover:bg-[#1b4332] disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-24">
              <span className="material-symbols-outlined text-4xl text-[#717973]">
                mark_chat_read
              </span>
              <h4 className="font-headline font-bold text-base text-[#012d1d]">
                Selecciona un ticket para responder
              </h4>
              <p className="text-xs text-[#717973] max-w-xs">
                Podrás revisar el hilo de mensajes y enviar respuestas con firma administrativa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

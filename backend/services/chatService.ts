import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { WebSocketServer, WebSocket } from 'ws';
import { usersStore } from '../controllers/authController';

export interface ServerChat {
  chat_id: string;
  client_id: string;
  client_name: string;
  client_avatar?: string;
  tailor_id: string;
  tailor_name: string;
  tailor_avatar?: string;
  last_message: string;
  last_message_time: string;
  updated_at: number;
}

export interface ServerChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: number;
  time: string;
  read_status: boolean;
}

const CHATS_FILE = path.resolve(process.cwd(), 'backend/data/chats.json');
const MESSAGES_FILE = path.resolve(process.cwd(), 'backend/data/messages.json');

const chatsStore = new Map<string, ServerChat>();
const messagesStore = new Map<string, ServerChatMessage>();
const onlineUsers = new Map<string, Set<WebSocket>>();
const socketSubscriptions = new Map<WebSocket, { userId?: string; chatIds: Set<string> }>();

function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function loadChatsAndMessagesFromDisk() {
  try {
    if (fs.existsSync(CHATS_FILE)) {
      const data = fs.readFileSync(CHATS_FILE, 'utf-8');
      const list: ServerChat[] = JSON.parse(data);
      if (Array.isArray(list)) {
        list.forEach((c) => chatsStore.set(c.chat_id, c));
      }
    }
  } catch (err) {
    console.error('Error loading chats from disk:', err);
  }

  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      const list: ServerChatMessage[] = JSON.parse(data);
      if (Array.isArray(list)) {
        list.forEach((m) => messagesStore.set(m.id, m));
      }
    }
  } catch (err) {
    console.error('Error loading messages from disk:', err);
  }
}

export function saveChatsToDisk() {
  try {
    const list = Array.from(chatsStore.values()).sort((a, b) => b.updated_at - a.updated_at);
    fs.mkdirSync(path.dirname(CHATS_FILE), { recursive: true });
    fs.writeFileSync(CHATS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving chats to disk:', err);
  }
}

export function saveMessagesToDisk() {
  try {
    const list = Array.from(messagesStore.values()).sort((a, b) => a.timestamp - b.timestamp);
    fs.mkdirSync(path.dirname(MESSAGES_FILE), { recursive: true });
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving messages to disk:', err);
  }
}

// Initial load
loadChatsAndMessagesFromDisk();

/**
 * Standard Curated Professionals
 */
export const INITIAL_TAILORS = [
  {
    id: 'dona-marta',
    name: 'Doña Marta',
    specialty: 'Especialista Textil y Modistería Ancestral',
    category: 'Bordado',
    rating: 4.9,
    reviewsCount: 124,
    location: 'Buenos Aires, Medellín, Antioquia, Colombia',
    distanceKm: 1.5,
    startingPrice: 20000,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    bio: 'Con más de 20 años de experiencia en la industria textil, me dedico a transformar prendas olvidadas en piezas únicas mediante bordado a mano, parches decorativos y ajustes de alta costura.',
    tags: ['Bordado Creativo', 'Teñido Natural', 'Parches Visibles', 'Sastrería Clásica'],
    isTopSeller: true,
  },
  {
    id: 'sofia-m',
    name: 'Sofía Montoya',
    specialty: 'Bordado Creativo y Sashiko Japonés',
    category: 'Bordado',
    rating: 4.9,
    reviewsCount: 142,
    location: 'Laureles, Medellín, Antioquia, Colombia',
    distanceKm: 1.2,
    startingPrice: 25000,
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    bio: 'Especialista en bordado botánico a mano y técnica japonesa Sashiko para transformar prendas denim y lino en obras de arte duraderas.',
    tags: ['Denim', 'Hilos orgánicos', 'Bordado a mano', 'Reparación visible'],
    isTopSeller: true,
  },
  {
    id: 'carlos-r',
    name: 'Carlos Ruiz',
    specialty: 'Sastrería Masculina y Transformación de Trajes',
    category: 'Sastrería',
    rating: 4.8,
    reviewsCount: 98,
    location: 'Poblado, Medellín, Antioquia, Colombia',
    distanceKm: 2.1,
    startingPrice: 35000,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    bio: 'Maestro sastre con enfoque en deconstrucción y modernización de blazers, abrigos y trajes clásicos.',
    tags: ['Sastrería Clásica', 'Deconstrucción', 'Trajes Formales', 'Ajustes Finos'],
    isTopSeller: false,
  },
  {
    id: 'taller-verde',
    name: 'Taller Verde Upcycling',
    specialty: 'Transformación Integral de Jeans y Chaquetas',
    category: 'Denim',
    rating: 4.9,
    reviewsCount: 165,
    location: 'Envigado, Antioquia, Colombia',
    distanceKm: 3.4,
    startingPrice: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=300&auto=format&fit=crop&q=80',
    bio: 'Colectivo de modistas enfocado en residuo cero y rescate de mezclilla vintage.',
    tags: ['Denim', 'Upcycling Estructural', 'Zero Waste', 'Diseño Urbano'],
    isTopSeller: true,
  },
  {
    id: 'studio-alba',
    name: 'Studio Alba',
    specialty: 'Alta Costura Circular y Rediseño de Vestidos',
    category: 'Alta Costura',
    rating: 5.0,
    reviewsCount: 89,
    location: 'El Retiro, Antioquia, Colombia',
    distanceKm: 4.8,
    startingPrice: 45000,
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio: 'Taller boutique especializado en rediseño de vestidos de novia, fiesta y sedas naturales.',
    tags: ['Alta Costura', 'Sedas', 'Rediseño de Novias', 'Pedrería Sostenible'],
    isTopSeller: true,
  },
];

/**
 * Returns merged list of tailors/modistas, combining curated tailors
 * and all registered users with role 'profesional' or 'tailor'.
 */
export function getTailorsList() {
  const dynamicTailors: any[] = [];
  const knownIds = new Set(INITIAL_TAILORS.map((t) => t.id));

  // Pull from active users in usersStore
  for (const user of usersStore.values()) {
    if (user.role === 'profesional' || user.role === 'tailor') {
      const uId = user.id || `pro-${user.email}`;
      if (!knownIds.has(uId)) {
        knownIds.add(uId);
        const loc =
          user.profile?.location ||
          user.location ||
          (user.profile?.municipality && user.profile?.department
            ? `${user.profile.municipality}, ${user.profile.department}`
            : user.municipality
            ? `${user.municipality}, Colombia`
            : 'Medellín, Antioquia, Colombia');

        dynamicTailors.push({
          id: uId,
          name: user.name || user.profile?.name || user.email.split('@')[0],
          email: user.email,
          specialty:
            user.specialty ||
            user.profile?.bio?.substring(0, 50) ||
            'Modistería Artesanal & Confección Sostenible',
          category: 'Modistería',
          rating: user.rating || 5.0,
          reviewsCount: user.reviewsCount || 1,
          location: loc,
          distanceKm: 1.0,
          startingPrice: user.startingPrice || 25000,
          imageUrl:
            user.avatarUrl ||
            user.picture ||
            user.profile?.avatarUrl ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}&backgroundColor=012d1d&textColor=b0f1cc`,
          bio:
            user.bio ||
            user.profile?.bio ||
            'Modista y taller artesanal registrado en Reborn Your Style. Confección, arreglos, ajustes y transformación de prendas.',
          tags: user.tags || ['Modistería', 'Arreglos', 'Moda Circular', 'Confección'],
          isTopSeller: false,
          isRegisteredUser: true,
        });
      }
    }
  }

  // Also check backend/data/users.json if any are not yet in memory
  try {
    const USERS_FILE = path.resolve(process.cwd(), 'backend/data/users.json');
    if (fs.existsSync(USERS_FILE)) {
      const diskUsers = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      if (Array.isArray(diskUsers)) {
        diskUsers.forEach((u) => {
          if ((u.role === 'profesional' || u.role === 'tailor') && !knownIds.has(u.id)) {
            knownIds.add(u.id);
            dynamicTailors.push({
              id: u.id,
              name: u.name || u.email.split('@')[0],
              email: u.email,
              specialty: u.specialty || 'Modistería y Sastrería Artesanal',
              category: 'Modistería',
              rating: 5.0,
              reviewsCount: 1,
              location: u.location || 'Medellín, Antioquia, Colombia',
              distanceKm: 1.0,
              startingPrice: 25000,
              imageUrl:
                u.avatarUrl ||
                u.picture ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name || u.email)}&backgroundColor=012d1d&textColor=b0f1cc`,
              bio: u.bio || 'Taller de costura registrado en Reborn Your Style.',
              tags: ['Modistería', 'Arreglos', 'Upcycling'],
              isTopSeller: false,
              isRegisteredUser: true,
            });
          }
        });
      }
    }
  } catch (err) {
    console.error('Error reading disk tailors:', err);
  }

  return [...dynamicTailors, ...INITIAL_TAILORS];
}

/**
 * Returns deterministic chat ID for client and tailor pair
 */
export function getDeterministicChatId(clientId: string, tailorId: string): string {
  const c = (clientId || 'guest_client').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const t = (tailorId || 'unknown_tailor').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  return `chat_${c}_${t}`;
}

/**
 * Retrieve chats for user (client or tailor)
 */
export function getChatsForUser(userId: string): ServerChat[] {
  const cleanId = (userId || '').trim();
  const allChats = Array.from(chatsStore.values());
  if (!cleanId || cleanId === 'admin') {
    return allChats.sort((a, b) => b.updated_at - a.updated_at);
  }

  return allChats
    .filter((c) => c.client_id === cleanId || c.tailor_id === cleanId)
    .sort((a, b) => b.updated_at - a.updated_at);
}

/**
 * Retrieve messages for a chat
 */
export function getMessagesForChat(chatId: string): ServerChatMessage[] {
  const cleanId = (chatId || '').trim();
  return Array.from(messagesStore.values())
    .filter((m) => m.chat_id === cleanId)
    .sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Create or save new message and update chat
 */
export function postChatMessage(data: {
  chat_id?: string;
  client_id: string;
  client_name?: string;
  client_avatar?: string;
  tailor_id: string;
  tailor_name?: string;
  tailor_avatar?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
}): { chat: ServerChat; message: ServerChatMessage } {
  const now = new Date();
  const timeFormatted = formatTime(now);
  const chatId = data.chat_id || getDeterministicChatId(data.client_id, data.tailor_id);

  let chat = chatsStore.get(chatId);
  if (!chat) {
    chat = {
      chat_id: chatId,
      client_id: data.client_id,
      client_name: data.client_name || 'Cliente',
      client_avatar: data.client_avatar,
      tailor_id: data.tailor_id,
      tailor_name: data.tailor_name || 'Modista / Taller',
      tailor_avatar: data.tailor_avatar,
      last_message: data.content,
      last_message_time: timeFormatted,
      updated_at: now.getTime(),
    };
  } else {
    chat.last_message = data.content;
    chat.last_message_time = timeFormatted;
    chat.updated_at = now.getTime();
    if (data.client_name && !chat.client_name) chat.client_name = data.client_name;
    if (data.tailor_name && !chat.tailor_name) chat.tailor_name = data.tailor_name;
    if (data.client_avatar && !chat.client_avatar) chat.client_avatar = data.client_avatar;
    if (data.tailor_avatar && !chat.tailor_avatar) chat.tailor_avatar = data.tailor_avatar;
  }
  chatsStore.set(chatId, chat);
  saveChatsToDisk();

  const msgId = `msg-${now.getTime()}-${crypto.randomBytes(3).toString('hex')}`;
  const message: ServerChatMessage = {
    id: msgId,
    chat_id: chatId,
    sender_id: data.sender_id,
    receiver_id: data.receiver_id,
    content: data.content,
    timestamp: now.getTime(),
    time: timeFormatted,
    read_status: false,
  };
  messagesStore.set(msgId, message);
  saveMessagesToDisk();

  // Broadcast to WebSockets
  broadcastToClients({
    type: 'new_message',
    chat,
    message,
  });

  return { chat, message };
}

/**
 * Mark messages in a chat as read
 */
export function markChatMessagesAsRead(chatId: string, currentUserId: string): number {
  let updated = 0;
  for (const msg of messagesStore.values()) {
    if (msg.chat_id === chatId && msg.receiver_id === currentUserId && !msg.read_status) {
      msg.read_status = true;
      updated++;
    }
  }
  if (updated > 0) {
    saveMessagesToDisk();
    broadcastToClients({
      type: 'messages_read',
      chatId,
      userId: currentUserId,
    });
  }
  return updated;
}

/**
 * Broadcast event to connected WebSocket clients
 */
export function broadcastToClients(event: any) {
  const payload = JSON.stringify(event);
  for (const [ws, info] of socketSubscriptions.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      // If event has a chat or message, check if relevant
      if (event.type === 'new_message') {
        const { chat, message } = event;
        const isSubscribedToChat = info.chatIds.has(chat.chat_id);
        const isParticipant =
          info.userId === chat.client_id ||
          info.userId === chat.tailor_id ||
          info.userId === message.sender_id ||
          info.userId === message.receiver_id;

        // Deliver if subscribed to chat, or user is participant, or wildcard listener
        if (isSubscribedToChat || isParticipant || !info.userId) {
          try {
            ws.send(payload);
          } catch (e) {
            console.error('Error sending WS message:', e);
          }
        }
      } else {
        try {
          ws.send(payload);
        } catch (e) {
          console.error('Error broadcasting WS event:', e);
        }
      }
    }
  }
}

/**
 * Set up WebSocket Server on HTTP server
 */
export function setupChatWebSocketServer(httpServer: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/chat' });

  wss.on('connection', (ws: WebSocket) => {
    socketSubscriptions.set(ws, { chatIds: new Set() });

    ws.on('message', (rawData: string) => {
      try {
        const data = JSON.parse(rawData.toString());
        const sub = socketSubscriptions.get(ws) || { chatIds: new Set() };

        switch (data.type) {
          case 'subscribe': {
            if (data.userId) {
              sub.userId = data.userId;
              if (!onlineUsers.has(data.userId)) {
                onlineUsers.set(data.userId, new Set());
              }
              onlineUsers.get(data.userId)!.add(ws);

              // Broadcast presence update
              broadcastToClients({
                type: 'presence',
                userId: data.userId,
                status: 'online',
              });
            }
            if (data.chatId) {
              sub.chatIds.add(data.chatId);
            }
            socketSubscriptions.set(ws, sub);

            // Send initial ack
            ws.send(
              JSON.stringify({
                type: 'subscribed',
                userId: sub.userId,
                chatIds: Array.from(sub.chatIds),
                onlineUsers: Array.from(onlineUsers.keys()),
              })
            );
            break;
          }

          case 'unsubscribe': {
            if (data.chatId) {
              sub.chatIds.delete(data.chatId);
              socketSubscriptions.set(ws, sub);
            }
            break;
          }

          case 'send_message': {
            if (data.content && data.sender_id && data.receiver_id) {
              const res = postChatMessage({
                chat_id: data.chat_id,
                client_id: data.client_id || (data.sender_role === 'cliente' ? data.sender_id : data.receiver_id),
                client_name: data.client_name,
                client_avatar: data.client_avatar,
                tailor_id: data.tailor_id || (data.sender_role === 'profesional' ? data.sender_id : data.receiver_id),
                tailor_name: data.tailor_name,
                tailor_avatar: data.tailor_avatar,
                sender_id: data.sender_id,
                receiver_id: data.receiver_id,
                content: data.content,
              });

              ws.send(
                JSON.stringify({
                  type: 'message_sent',
                  success: true,
                  chat: res.chat,
                  message: res.message,
                })
              );
            }
            break;
          }

          case 'mark_read': {
            if (data.chatId && data.userId) {
              markChatMessagesAsRead(data.chatId, data.userId);
            }
            break;
          }

          case 'ping': {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          }
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      const sub = socketSubscriptions.get(ws);
      if (sub?.userId) {
        const userSockets = onlineUsers.get(sub.userId);
        if (userSockets) {
          userSockets.delete(ws);
          if (userSockets.size === 0) {
            onlineUsers.delete(sub.userId);
            broadcastToClients({
              type: 'presence',
              userId: sub.userId,
              status: 'offline',
            });
          }
        }
      }
      socketSubscriptions.delete(ws);
    });

    ws.on('error', (err) => {
      console.warn('[WS Socket Warning]:', err.message);
    });
  });

  console.log('[WebSocket Server] Chat WebSocket server ready on /ws/chat');
  return wss;
}

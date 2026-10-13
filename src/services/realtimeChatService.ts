import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ChatConversation, ChatMessage, MessageItem, Professional } from '../types';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Initiates the official Google Account Selector popup via Firebase Authentication / Google OAuth.
 */
export async function signInWithGooglePopup(): Promise<UserCredential> {
  return await signInWithPopup(auth, googleProvider);
}

/**
 * Computes deterministic room ID for 2 participants
 */
export function getRoomId(userAId: string, userBId: string): string {
  const cleanA = (userAId || 'guest_client').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanB = (userBId || 'unknown_tailor').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const sorted = [cleanA, cleanB].sort();
  return `room_${sorted[0]}_${sorted[1]}`;
}

/**
 * Subscribes to real-time messages for a room via Firestore
 */
export function subscribeToRoomMessages(
  roomId: string,
  onUpdate: (messages: MessageItem[]) => void
): () => void {
  try {
    const messagesCol = collection(db, 'chat_rooms', roomId, 'messages');
    const q = query(messagesCol, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs: MessageItem[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            sender: d.senderRole === 'user' ? 'user' : d.senderRole === 'pro' ? 'pro' : 'other',
            text: d.text || '',
            time: d.timeFormatted || (d.createdAt?.toDate ? d.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ahora'),
          };
        });
        onUpdate(msgs);
      },
      (error) => {
        console.warn('Realtime Firestore snapshot listener fallback:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Could not initialize realtime firestore subscription:', err);
    return () => {};
  }
}

/**
 * Sends a real-time message to a room with dual-write to Firestore
 */
export async function sendRealtimeChatMessage(
  roomId: string,
  message: {
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'pro';
    text: string;
  }
): Promise<void> {
  try {
    const roomRef = doc(db, 'chat_rooms', roomId);
    await setDoc(
      roomRef,
      {
        roomId,
        lastMessage: message.text,
        lastSenderId: message.senderId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    const messagesCol = collection(db, 'chat_rooms', roomId, 'messages');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    await addDoc(messagesCol, {
      senderId: message.senderId,
      senderName: message.senderName,
      senderRole: message.senderRole,
      text: message.text,
      timeFormatted: nowTime,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Error sending message to Firestore real-time room:', err);
  }
}

// =============================================================================
// BACKEND REAL-TIME MESSAGING & DIRECTORY SERVICES (WhatsApp Architecture)
// =============================================================================

/**
 * Fetches dynamic list of professionals/tailors directly from backend database
 */
export async function fetchServerTailors(): Promise<Professional[]> {
  try {
    const res = await fetch('/api/tailors');
    if (!res.ok) return [];
    const data = await res.json();
    if (data.success && Array.isArray(data.tailors)) {
      return data.tailors.map((t: any) => ({
        id: t.id,
        name: t.name,
        specialty: t.specialty || 'Modistería y Sastrería Artesanal',
        category: t.category || 'Upcycling Estructural',
        rating: t.rating || 5.0,
        reviewsCount: t.reviewsCount || 1,
        location: t.location || 'Medellín, Antioquia, Colombia',
        address: t.address || '',
        distanceKm: t.distanceKm || 1.0,
        startingPrice: t.startingPrice || 25000,
        imageUrl:
          t.imageUrl ||
          t.avatarUrl ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.name)}&backgroundColor=012d1d&textColor=b0f1cc`,
        bio: t.bio || 'Taller de costura registrado en Reborn Your Style.',
        tags: Array.isArray(t.tags) ? t.tags : ['Modistería', 'Arreglos', 'Upcycling'],
        isTopSeller: Boolean(t.isTopSeller),
        portfolio: Array.isArray(t.portfolio) ? t.portfolio : [],
        reviews: Array.isArray(t.reviews) ? t.reviews : [],
      }));
    }
    return [];
  } catch (err) {
    console.warn('Error fetching server tailors:', err);
    return [];
  }
}

/**
 * Fetches user's persistent chat conversations from backend database
 */
export async function fetchServerChats(userId: string): Promise<ChatConversation[]> {
  if (!userId) return [];
  try {
    const res = await fetch(`/api/chats?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.success && Array.isArray(data.chats)) {
      return data.chats.map((c: any) => {
        const isClient = c.client_id === userId;
        const participantId = isClient ? c.tailor_id : c.client_id;
        const participantName = isClient ? (c.tailor_name || 'Taller') : (c.client_name || 'Cliente');
        const participantAvatar = isClient ? (c.tailor_avatar || '') : (c.client_avatar || '');

        return {
          id: c.chat_id,
          participantId,
          participantName,
          participantRole: isClient ? 'Modista / Taller' : 'Cliente Reborn',
          participantAvatar,
          lastMessage: c.last_message || '',
          lastMessageTime: c.last_message_time || '',
          unreadCount: 0,
          messages: [],
        };
      });
    }
    return [];
  } catch (err) {
    console.warn('Error fetching server chats:', err);
    return [];
  }
}

/**
 * Fetches messages for a specific chat from backend database
 */
export async function fetchServerMessages(chatId: string, currentUserId: string): Promise<ChatMessage[]> {
  if (!chatId) return [];
  try {
    const res = await fetch(`/api/chats/${encodeURIComponent(chatId)}/messages`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.success && Array.isArray(data.messages)) {
      return data.messages.map((m: any) => ({
        id: m.id,
        sender: m.sender_id === currentUserId ? 'user' : 'other',
        text: m.content || '',
        time: m.time || 'Ahora',
      }));
    }
    return [];
  } catch (err) {
    console.warn('Error fetching server messages:', err);
    return [];
  }
}

/**
 * Posts a message to the backend database with instant persistent storage
 */
export async function postServerChatMessage(data: {
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
}): Promise<{ success: boolean; chat?: any; message?: any }> {
  try {
    const res = await fetch('/api/chats/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return { success: false };
    return await res.json();
  } catch (err) {
    console.error('Error posting message to server chat:', err);
    return { success: false };
  }
}

/**
 * Subscribes to live chat updates using WebSocket with active polling fallback.
 * Ensures bidirectional messages appear instantaneously without page reload!
 */
export function subscribeToLiveChat(
  chatId: string,
  currentUserId: string,
  onUpdate: (messages: ChatMessage[]) => void
): () => void {
  let isUnsubscribed = false;
  let ws: WebSocket | null = null;
  let pollInterval: any = null;

  // 1. Initial fetch from server
  fetchServerMessages(chatId, currentUserId).then((msgs) => {
    if (!isUnsubscribed && msgs.length > 0) {
      onUpdate(msgs);
    }
  });

  // 2. Setup WebSocket connection
  try {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      if (isUnsubscribed) {
        ws?.close();
        return;
      }
      ws?.send(
        JSON.stringify({
          type: 'subscribe',
          userId: currentUserId,
          chatId,
        })
      );
    };

    ws.onmessage = (event) => {
      if (isUnsubscribed) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && (data.chat?.chat_id === chatId || data.message?.chat_id === chatId)) {
          // Re-fetch clean list or append
          fetchServerMessages(chatId, currentUserId).then((msgs) => {
            if (!isUnsubscribed) onUpdate(msgs);
          });
        }
      } catch (e) {
        console.warn('WS message parse error:', e);
      }
    };

    ws.onerror = () => {
      // Graceful fallback to live polling
    };
  } catch (err) {
    console.warn('WebSocket connection init notice:', err);
  }

  // 3. Fallback active polling every 2.5 seconds to guarantee 100% reliability
  pollInterval = setInterval(() => {
    if (isUnsubscribed) return;
    fetchServerMessages(chatId, currentUserId).then((msgs) => {
      if (!isUnsubscribed && msgs.length > 0) {
        onUpdate(msgs);
      }
    });
  }, 2500);

  return () => {
    isUnsubscribed = true;
    if (pollInterval) clearInterval(pollInterval);
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: 'unsubscribe', chatId }));
        ws.close();
      } catch {
        // noop
      }
    }
  };
}

/**
 * Updates a tailor's or client's profile in the server database
 */
export async function updateServerProfile(profileData: {
  id?: string;
  email?: string;
  name?: string;
  bio?: string;
  location?: string;
  address?: string;
  phone?: string;
  instagram?: string;
  avatarUrl?: string;
  specialty?: string;
  startingPrice?: number;
  tags?: string[];
}): Promise<boolean> {
  try {
    const res = await fetch('/api/users/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) return false;
    const json = await res.json();
    return Boolean(json.success);
  } catch (err) {
    console.error('Error updating profile on server:', err);
    return false;
  }
}

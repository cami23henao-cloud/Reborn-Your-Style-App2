import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, UserCredential } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ChatConversation, MessageItem } from '../types';

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
  const sorted = [userAId, userBId].sort();
  return `room_${sorted[0]}_${sorted[1]}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Subscribes to real-time messages for a room
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

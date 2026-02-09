import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { User, ChatMessage } from '../types.ts';

// COLE SUAS CONFIGURAÇÕES DO FIREBASE AQUI
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export class DatabaseService {
  async init(): Promise<void> {
    return Promise.resolve();
  }

  async saveUser(user: User): Promise<void> {
    // Salva o usuário usando o username como ID único
    await setDoc(doc(db, "users", user.username), user);
  }

  async getUser(username: string): Promise<User | null> {
    const docRef = doc(db, "users", username);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as User) : null;
  }

  async saveMessage(message: ChatMessage): Promise<void> {
    // Salva a mensagem na nuvem
    await addDoc(collection(db, "messages"), message);
  }

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    // O SEGREDO CONTRA A TELA PRETA: limitamos a 40 mensagens para não sobrecarregar
    try {
      const q = query(
        collection(db, "messages"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc"),
        limit(40)
      );
      const querySnapshot = await getDocs(q);
      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        messages.push(doc.data() as ChatMessage);
      });
      // Inverte para ficar na ordem cronológica (mais antiga para mais nova)
      return messages.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      return [];
    }
  }
}

export const dbService = new DatabaseService();

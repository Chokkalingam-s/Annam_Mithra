import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../config/firebase";

class ChatService {
  /**
   * Create or get existing chat between two users
   * @param {string} donorId - Donor's Firebase UID
   * @param {string} receiverId - Receiver's Firebase UID
   * @param {string} donationId - Donation ID
   * @param {object} donationDetails - { title, donorName, receiverName, donorEmail, receiverEmail }
   * @returns {string} chatId
   */
  async createOrGetChat(donorId, receiverId, donationId, donationDetails) {
    try {
      // Check if chat already exists for this donation
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("donationId", "==", donationId),
        where("participants", "array-contains", donorId),
      );

      const snapshot = await getDocs(q);
      const existingChat = snapshot.docs.find((doc) =>
        doc.data().participants.includes(receiverId),
      );

      if (existingChat) {
        return existingChat.id;
      }

      // Create new chat
      const chatDoc = await addDoc(chatsRef, {
        participants: [donorId, receiverId],
        participantDetails: {
          [donorId]: {
            name: donationDetails.donorName,
            email: donationDetails.donorEmail,
          },
          [receiverId]: {
            name: donationDetails.receiverName,
            email: donationDetails.receiverEmail,
          },
        },
        donationId,
        donationTitle: donationDetails.title,
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        lastMessageSender: "",
        unreadCount: {
          [donorId]: 0,
          [receiverId]: 0,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return chatDoc.id;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  }

  /**
   * Send a message in a chat
   * @param {string} chatId - Chat ID
   * @param {string} senderId - Sender's Firebase UID
   * @param {string} text - Message text
   */
  async sendMessage(chatId, senderId, text) {
    try {
      const messagesRef = collection(db, `chats/${chatId}/messages`);

      // Add message
      await addDoc(messagesRef, {
        senderId,
        text,
        timestamp: serverTimestamp(),
        read: false,
        type: "text",
      });

      // Update chat document
      const chatRef = doc(db, "chats", chatId);
      const chatSnapshot = await getDocs(
        query(collection(db, "chats"), where("__name__", "==", chatId)),
      );
      const chatData = chatSnapshot.docs[0]?.data();

      if (chatData) {
        const otherUserId = chatData.participants.find((id) => id !== senderId);

        await updateDoc(chatRef, {
          lastMessage: text.substring(0, 100), // Truncate long messages
          lastMessageTime: serverTimestamp(),
          lastMessageSender: senderId,
          [`unreadCount.${otherUserId}`]: increment(1),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  /**
   * Subscribe to messages in real-time
   * @param {string} chatId - Chat ID
   * @param {function} callback - Callback with messages array
   * @returns {function} Unsubscribe function
   */
  subscribeToMessages(chatId, callback) {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });
  }

  /**
   * Subscribe to user's chats in real-time
   * @param {string} userId - User's Firebase UID
   * @param {function} callback - Callback with chats array
   * @returns {function} Unsubscribe function
   */
  subscribeToUserChats(userId, callback) {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", userId),
      orderBy("lastMessageTime", "desc"),
    );

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(chats);
    });
  }

  /**
   * Mark messages as read
   * @param {string} chatId - Chat ID
   * @param {string} userId - User's Firebase UID
   */
  async markAsRead(chatId, userId) {
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0,
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }

  /**
   * Get chat details
   * @param {string} chatId - Chat ID
   * @returns {object} Chat data
   */
  async getChatDetails(chatId) {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnapshot = await getDocs(
        query(collection(db, "chats"), where("__name__", "==", chatId)),
      );
      return chatSnapshot.docs[0]?.data();
    } catch (error) {
      console.error("Error getting chat details:", error);
      throw error;
    }
  }
}

export default new ChatService();

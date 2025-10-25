import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatWindow from "../components/chat/ChatWindow";
import chatService from "../services/chatService";

const ChatWindowPage = () => {
  const { chatId } = useParams();
  const [chatDetails, setChatDetails] = useState(null);

  useEffect(() => {
    const fetchChatDetails = async () => {
      try {
        const details = await chatService.getChatDetails(chatId);
        setChatDetails(details);
      } catch (error) {
        console.error("Error fetching chat details:", error);
      }
    };

    fetchChatDetails();
  }, [chatId]);

  return <ChatWindow chatId={chatId} chatDetails={chatDetails} />;
};

export default ChatWindowPage;

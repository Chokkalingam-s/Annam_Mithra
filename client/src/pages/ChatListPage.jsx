import React from "react";
import ChatList from "../components/chat/ChatList";
import BottomNav from "../components/receiver/BottomNav";

const ChatListPage = () => {
  return (
    <>
      <ChatList />
      <BottomNav currentPage="messages" />
    </>
  );
};

export default ChatListPage;

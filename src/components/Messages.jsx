import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import Message from "./Message";

const Messages = () => {
  const { messages } = useContext(ChatContext);

  return (
    <div className="messages">
      {messages.map((m) => (
        <Message message={m} key={m.id} />
      ))}
    </div>
  );
};

export default Messages;
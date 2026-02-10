//It dispays the current person you are talking to and the conversation
import React, { useContext } from "react";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";

const Chat = () => {
  const { data } = useContext(ChatContext);

  return (
    <div className="chat">
      <div className="chatInfo">
       <img src={data.user?.photo_url ? `http://localhost:8000${data.user.photo_url}` : ""} alt="" /> 
        <span>{data.user?.display_name}</span>
        <span>(online)</span>
      </div>
      <Messages />
      <Input/>
    </div>
  );
};

export default Chat;
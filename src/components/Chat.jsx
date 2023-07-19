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
       <img src={data.user?.photoURL} alt="" /> 
        <span>{data.user?.displayName}</span>
        <span>(online)</span>
      </div>
      <Messages />
      <Input/>
    </div>
  );
};

export default Chat;
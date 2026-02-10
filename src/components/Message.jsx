import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const API_BASE = "http://localhost:8000";

  return (
    <div
      ref={ref}
      className={`message ${message.sender_id === currentUser?.id && "owner"}`}
    >
      <div className="messageInfo">
        <img
          src={
            message.sender_id === currentUser?.id
              ? (currentUser?.photo_url ? `${API_BASE}${currentUser.photo_url}` : "")
              : (data.user?.photo_url ? `${API_BASE}${data.user.photo_url}` : "")
          }
          alt=""
        />
      </div>
      <div className="messageContent">
        <p>{message.text}</p>
        {message.img && <img src={message.img.startsWith('http') ? message.img : `${API_BASE}${message.img}`} alt="An attachment was sent" />}
      </div>
    </div>
  );
};

export default Message;
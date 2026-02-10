import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Chats = () => {
  const [chats, setChats] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    const getChats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8000/conversations", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          // Keep the data as an object to match the previous structure if possible, 
          // or just map through the array. 
          // Previous structure: { [chatId]: { userInfo, lastMessage, date } }
          const chatObj = {};
          data.forEach(chat => {
            chatObj[chat.id] = chat;
          });
          setChats(chatObj);
        }
      } catch (err) {
        console.error(err);
      }
    };

    currentUser && getChats();
  }, [currentUser]);

  const handleSelect = (chat) => {
    dispatch({ type: "CHANGE_USER", payload: { user: chat.userInfo, chatId: chat.id } });
  };

  return (
    <div className="chats">
      {Object.entries(chats)?.sort((a,b)=> new Date(b[1].date) - new Date(a[1].date)).map((chat) => (
        <div
          className="userChat"
          key={chat[0]}
          onClick={() => handleSelect(chat[1])}
        >
          <img src={chat[1].userInfo.photo_url ? `http://localhost:8000${chat[1].userInfo.photo_url}` : ""} alt="" />
          <div className="userChatInfo">
            <span>{chat[1].userInfo.display_name}</span>
            <p>{chat[1].lastMessage?.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;
import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useState,
    useRef
  } from "react";
  import { AuthContext } from "./AuthContext";
  
  export const ChatContext = createContext();
  
  export const ChatContextProvider = ({ children }) => {
    const { currentUser } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const socket = useRef(null);

    const INITIAL_STATE = {
      chatId: "null",
      user: {},
    };
  
    const chatReducer = (state, action) => {
      switch (action.type) {
        case "CHANGE_USER":
          return {
            user: action.payload.user,
            chatId: action.payload.chatId || "null"
          };
  
        default:
          return state;
      }
    };
  
    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

    const chatIdRef = useRef(state.chatId);
    useEffect(() => {
        chatIdRef.current = state.chatId;
    }, [state.chatId]);

    useEffect(() => {
        if (!currentUser) return;

        const token = localStorage.getItem("token");
        const ws = new WebSocket(`ws://localhost:8000/ws/${token}`);

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "new_message") {
                // Use ref to check current chatId without triggering effect re-run
                if (data.message.conversation_id === chatIdRef.current) {
                    setMessages(prev => [...prev, data.message]);
                }
            }
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
        };

        socket.current = ws;

        return () => {
            ws.close();
        };
    }, [currentUser]); // Only depends on currentUser, not state.chatId

    const sendMessage = (text, img = null) => {
        if (state.chatId === "null") return;
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({
                type: "message",
                conversation_id: state.chatId,
                text,
                img
            }));
        }
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (state.chatId === "null") return;
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:8000/conversations/${state.chatId}/messages`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    setMessages(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();
    }, [state.chatId]);
  
    return (
      <ChatContext.Provider value={{ data:state, dispatch, messages, sendMessage }}>
        {children}
      </ChatContext.Provider>
    );
  };
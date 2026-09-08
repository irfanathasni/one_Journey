import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import socket from "../../socket/socket";
import axiosInstance from "../../services/axiosInstance";
import { useSelector } from "react-redux";
import "./CustomerMessages.css";

const CustomerMessages = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(
    location.state?.conversation || null
  );
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axiosInstance.get("/chat/conversations");
      const data = res.data.data || [];

      setConversations(data);

      if (location.state?.conversation) {
        const exists = data.find(
          (item) => item._id === location.state.conversation._id
        );

        if (exists) {
          setSelectedConversation(exists);
        }
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

 
  const openConversation = async (conversation) => {
    try {
      setSelectedConversation(conversation);

      const res = await axiosInstance.get(
        `/chat/messages/${conversation._id}`
      );

      setMessages(res.data.data || []);

      socket.emit("joinConversation", conversation._id);
      socket.emit("markMessagesAsRead", conversation._id);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  useEffect(() => {
    if (selectedConversation?._id) {
      socket.emit("joinConversation", selectedConversation._id);
      socket.emit("markMessagesAsRead", selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
  const handleReceiveMessage = (newMessage) => {
  const conversationId =
    newMessage.conversation?._id || newMessage.conversation;

  if (conversationId === selectedConversation?._id) {
    setMessages((prev) => {
      if (prev.some((msg) => msg._id === newMessage._id)) {
        return prev;
      }

      return [...prev, newMessage];
    });
    if (newMessage.receiver?._id?.toString() === user?._id?.toString()) {
      socket.emit("markMessagesAsRead", conversationId);
    }
  }
  setConversations((prev) =>
    prev.map((conversation) =>
      conversation._id === conversationId
        ? {
            ...conversation,
            lastMessage: newMessage.message,
            lastMessageAt: newMessage.createdAt,
          }
        : conversation
    )
  );
};
    const handleUserStatus = ({ userId, status }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: status === "online",
      }));
    };

    const handleMessagesRead = ({ conversationId }) => {
      if (conversationId !== selectedConversation?._id) {
        return;
      }

      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          isRead: true,
        }))
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userStatusChanged", handleUserStatus);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userStatusChanged", handleUserStatus);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [selectedConversation, user?._id]);

  
  const sendMessage = (e) => {
    e.preventDefault();

    if (!message.trim() || !selectedConversation) return;

    socket.emit("sendMessage", {
      conversationId: selectedConversation._id,
      message: message.trim(),
    });

    setMessage("");
  };

  return (
<div className="responsive-page" style={styles.page}>
        <div style={styles.header}>
        <p style={styles.eyebrow}>MESSAGES</p>
        <h1 style={styles.title}>Messages</h1>
        <p style={styles.subtitle}>Chat with your vendors.</p>
      </div>

<div className="chat-container" style={styles.chatContainer}>
          <div className="conversation-panel" style={styles.conversationPanel}>
          <h3 style={styles.panelTitle}>Conversations</h3>

          {loading ? (
            <p style={styles.emptyText}>
              Loading...
            </p>
          ) : conversations.length === 0 ? (
            <p style={styles.emptyText}>
              No conversations yet.
            </p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => openConversation(conversation)}
                style={{
                  ...styles.conversation,
                  ...(selectedConversation?._id === conversation._id
                    ? styles.selectedConversation
                    : {}),
                }}
              >
                <div style={styles.avatar}>
                  {conversation.vendor?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div style={styles.conversationInfo}>
                  <strong>
                    {conversation.vendor?.name || "Vendor"}
                  </strong>

                  <p style={styles.lastMessage}>
                    {conversation.lastMessage ||
                      "Start chatting"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="chat-panel" style={styles.chatPanel}>
          {!selectedConversation ? (
            <div style={styles.noChat}>
              <div style={styles.chatIcon}>💬</div>

              <h3>Select a conversation</h3>

              <p>Choose a vendor to start chatting.</p>
            </div>
          ) : (
            <>
              <div style={styles.chatHeader}>
                <div style={styles.avatar}>
                  {selectedConversation.vendor?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {selectedConversation.vendor?.name ||
                      "Vendor"}
                  </strong>

                  <p
                    style={{
                      ...styles.onlineText,
                      color: onlineUsers[
                        selectedConversation.vendor?._id
                      ]
                        ? "#2E8B57"
                        : "#999",
                    }}
                  >
                    {onlineUsers[
                      selectedConversation.vendor?._id
                    ]
                      ? "● Online"
                      : "○ Offline"}
                  </p>
                </div>
              </div>

            <div className="messagesArea" style={styles.messagesArea}>
                  {messages.length === 0 ? (
                  <div style={styles.emptyChat}>
                    No messages yet. Say hello 👋
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderId =
                      msg.sender?._id || msg.sender;

                    const isMine =
                      senderId?.toString() ===
                      user?._id?.toString();

                    return (
                      <div
                        key={msg._id}
                        style={{
                          ...styles.messageRow,
                          justifyContent: isMine
                            ? "flex-end"
                            : "flex-start",
                        }}
                      >
                      <div className="messageBubble"
                         style={{...styles.messageBubble,...(isMine
                            ? styles.myMessage
                             : styles.theirMessage)}}>
                          <div>{msg.message}</div>

                          <span style={styles.messageTime}>
                            {new Date(
                              msg.createdAt
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}

                            {isMine && (
                              <span style={{
                                  marginLeft: "5px",
                                }}>
                                {msg.isRead
                                  ? "✓✓"
                                  : "✓"}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
             <form onSubmit={sendMessage} className="inputArea"
                style={styles.inputArea}>
               <input className="messageInput" value={message}
                 onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..."
                    style={styles.messageInput} />
            <button type="submit" className="sendButton" style={styles.sendButton}>
               Send
            </button>
         </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: "35px",
    minHeight: "100vh",
    background: "#FBF8F3",
    boxSizing: "border-box",
  },

  header: {
    marginBottom: "25px",
  },

  eyebrow: {
    fontSize: "11px",
    letterSpacing: "2px",
    color: "#C97B84",
    fontWeight: "600",
    margin: 0,
  },

  title: {
    margin: "5px 0 0",
    fontFamily: "Georgia, serif",
    fontSize: "32px",
    fontWeight: "400",
    color: "#3D5A50",
  },

  subtitle: {
    color: "#777",
    fontSize: "13px",
  },

  chatContainer: {
    display: "flex",
    height: "600px",
    background: "#FFFFFF",
    border: "1px solid #E5DFD5",
    borderRadius: "14px",
    overflow: "hidden",
  },

  conversationPanel: {
    width: "300px",
    borderRight: "1px solid #E5DFD5",
    padding: "20px",
    overflowY: "auto",
  },

  panelTitle: {
    margin: "0 0 15px",
    color: "#3D5A50",
    fontFamily: "Georgia, serif",
    fontWeight: "400",
  },

  conversation: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "9px",
    cursor: "pointer",
    marginBottom: "5px",
  },

  selectedConversation: {
    background: "#F5E9E8",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#3D5A50",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    flexShrink: 0,
  },

  conversationInfo: {
    minWidth: 0,
  },

  lastMessage: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#888",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "190px",
  },

  emptyText: {
    color: "#999",
    fontSize: "13px",
  },

  chatPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 20px",
    borderBottom: "1px solid #E5DFD5",
  },

  onlineText: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#777",
  },

  messagesArea: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    background: "#FCFBF9",
  },

  messageRow: {
    display: "flex",
    marginBottom: "10px",
  },

  messageBubble: {
    maxWidth: "65%",
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "13px",
  },

  myMessage: {
    background: "#3D5A50",
    color: "#FFFFFF",
  },

  theirMessage: {
    background: "#E7F2EC",
    color: "#333",
  },

  messageTime: {
    display: "block",
    fontSize: "9px",
    marginTop: "4px",
    opacity: 0.7,
    textAlign: "right",
  },

  emptyChat: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#999",
    fontSize: "13px",
  },

  noChat: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#777",
  },

  chatIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  inputArea: {
    display: "flex",
    gap: "10px",
    padding: "15px",
    borderTop: "1px solid #E5DFD5",
  },

  messageInput: {
    flex: 1,
    padding: "11px 13px",
    border: "1px solid #DCD5CA",
    borderRadius: "8px",
    outline: "none",
  },

  sendButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#174D40",
    color: "#FFFFFF",
    cursor: "pointer",
  },
};

export default CustomerMessages;

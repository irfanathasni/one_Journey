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
  const [selectedConversation, setSelectedConversation] =
    useState(location.state?.conversation || null);
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
          (item) =>
            item._id === location.state.conversation._id
        );

        if (exists) {
          setSelectedConversation(exists);
        }
      }
    } catch (error) {
      console.error(
        "Failed to fetch conversations:",
        error
      );
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

      socket.emit(
        "joinConversation",
        conversation._id
      );

      socket.emit(
        "markMessagesAsRead",
        conversation._id
      );
    } catch (error) {
      console.error(
        "Failed to load messages:",
        error
      );
    }
  };

  useEffect(() => {
    if (selectedConversation?._id) {
      socket.emit(
        "joinConversation",
        selectedConversation._id
      );

      socket.emit(
        "markMessagesAsRead",
        selectedConversation._id
      );
    }
  }, [selectedConversation]);

  useEffect(() => {
    const handleReceiveMessage = (newMessage) => {
      const conversationId =
        newMessage.conversation?._id ||
        newMessage.conversation;

      if (
        conversationId === selectedConversation?._id
      ) {
        setMessages((prev) => {
          if (
            prev.some(
              (msg) => msg._id === newMessage._id
            )
          ) {
            return prev;
          }

          return [...prev, newMessage];
        });

        if (
          newMessage.receiver?._id?.toString() ===
          user?._id?.toString()
        ) {
          socket.emit(
            "markMessagesAsRead",
            conversationId
          );
        }
      }

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                lastMessage:
                  newMessage.message,
                lastMessageAt:
                  newMessage.createdAt,
              }
            : conversation
        )
      );
    };

    const handleUserStatus = ({
      userId,
      status,
    }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: status === "online",
      }));
    };

    const handleMessagesRead = ({
      conversationId,
    }) => {
      if (
        conversationId !==
        selectedConversation?._id
      ) {
        return;
      }

      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          isRead: true,
        }))
      );
    };

    socket.on(
      "receiveMessage",
      handleReceiveMessage
    );

    socket.on(
      "userStatusChanged",
      handleUserStatus
    );

    socket.on(
      "messagesRead",
      handleMessagesRead
    );

    return () => {
      socket.off(
        "receiveMessage",
        handleReceiveMessage
      );

      socket.off(
        "userStatusChanged",
        handleUserStatus
      );

      socket.off(
        "messagesRead",
        handleMessagesRead
      );
    };
  }, [selectedConversation, user?._id]);

  const sendMessage = (e) => {
    e.preventDefault();

    if (
      !message.trim() ||
      !selectedConversation
    ) {
      return;
    }

    socket.emit("sendMessage", {
      conversationId:
        selectedConversation._id,
      message: message.trim(),
    });

    setMessage("");
  };

  return (
    <div
      className="responsive-page customer-messages-page"
      style={styles.page}
    >
      {/* HEADER */}
      <div
        style={styles.header}
        className="customer-messages-header"
      >
        <p style={styles.eyebrow}>MESSAGES</p>

        <h1
          style={styles.title}
          className="customer-messages-title"
        >
          Messages
        </h1>

        <p style={styles.subtitle}>
          Chat with your vendors.
        </p>
      </div>

      {/* CHAT CONTAINER */}
      <div
        className="chat-container customer-chat-container"
        style={styles.chatContainer}
      >
        {/* CONVERSATION PANEL */}
        <div
          className="conversation-panel customer-conversation-panel"
          style={styles.conversationPanel}
        >
          <h3 style={styles.panelTitle}>
            Conversations
          </h3>

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
                onClick={() =>
                  openConversation(conversation)
                }
                style={{
                  ...styles.conversation,
                  ...(selectedConversation?._id ===
                  conversation._id
                    ? styles.selectedConversation
                    : {}),
                }}
                className="customer-conversation-item"
              >
                <div style={styles.avatar}>
                  {conversation.vendor?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div
                  style={styles.conversationInfo}
                  className="customer-conversation-info"
                >
                  <strong>
                    {conversation.vendor?.name ||
                      "Vendor"}
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

        {/* CHAT PANEL */}
        <div
          className="chat-panel customer-chat-panel"
          style={styles.chatPanel}
        >
          {!selectedConversation ? (
            <div style={styles.noChat}>
              <div style={styles.chatIcon}>
                💬
              </div>

              <h3>Select a conversation</h3>

              <p>
                Choose a vendor to start chatting.
              </p>
            </div>
          ) : (
            <>
              {/* CHAT HEADER */}
              <div
                style={styles.chatHeader}
                className="customer-chat-header"
              >
                <div style={styles.avatar}>
                  {selectedConversation.vendor?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div
                  className="customer-chat-header-info"
                >
                  <strong>
                    {selectedConversation.vendor
                      ?.name || "Vendor"}
                  </strong>

                  <p
                    style={{
                      ...styles.onlineText,
                      color:
                        onlineUsers[
                          selectedConversation
                            .vendor?._id
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

              {/* MESSAGES */}
              <div
                className="messagesArea customer-messages-area"
                style={styles.messagesArea}
              >
                {messages.length === 0 ? (
                  <div style={styles.emptyChat}>
                    No messages yet. Say hello 👋
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderId =
                      msg.sender?._id ||
                      msg.sender;

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
                        className="customer-message-row"
                      >
                        <div
                          className="messageBubble"
                          style={{
                            ...styles.messageBubble,
                            ...(isMine
                              ? styles.myMessage
                              : styles.theirMessage),
                          }}
                        >
                          <div
                            className="customer-message-text"
                          >
                            {msg.message}
                          </div>

                          <span
                            style={
                              styles.messageTime
                            }
                          >
                            {new Date(
                              msg.createdAt
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}

                            {isMine && (
                              <span
                                style={{
                                  marginLeft: "5px",
                                }}
                              >
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

              {/* MESSAGE INPUT */}
              <form
                onSubmit={sendMessage}
                className="inputArea customer-message-input-area"
                style={styles.inputArea}
              >
                <input
                  className="messageInput customer-message-input"
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="Type a message..."
                  style={styles.messageInput}
                />

                <button
                  type="submit"
                  className="sendButton customer-send-button"
                  style={styles.sendButton}
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* RESPONSIVE CSS */}
      <style>{`
        @media (max-width: 1024px) {
          .customer-messages-page {
            padding: 30px 25px !important;
          }

          .customer-chat-container {
            height: 600px !important;
          }

          .customer-conversation-panel {
            width: 270px !important;
          }
        }

        @media (max-width: 768px) {
          .customer-messages-page {
            padding: 28px 20px !important;
          }

          .customer-messages-title {
            font-size: 29px !important;
          }

          .customer-chat-container {
            height: calc(100vh - 190px) !important;
            min-height: 500px;
          }

          .customer-conversation-panel {
            width: 230px !important;
            padding: 15px !important;
          }

          .customer-conversation-item {
            padding: 10px !important;
            gap: 9px !important;
          }

          .customer-conversation-info {
            min-width: 0;
          }

          .customer-conversation-info strong {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .customer-chat-header {
            padding: 13px 15px !important;
          }

          .customer-messages-area {
            padding: 15px !important;
          }

          .messageBubble {
            max-width: 75% !important;
          }

          .customer-message-input-area {
            padding: 12px !important;
          }
        }

        @media (max-width: 600px) {
          .customer-messages-page {
            padding: 22px 15px !important;
          }

          .customer-messages-header {
            margin-bottom: 18px !important;
          }

          .customer-messages-title {
            font-size: 27px !important;
          }

          .customer-chat-container {
            height: 650px !important;
            min-height: 0 !important;
            flex-direction: column !important;
          }

          .customer-conversation-panel {
            width: 100% !important;
            height: 175px !important;
            max-height: 175px !important;
            border-right: none !important;
            border-bottom: 1px solid #E5DFD5;
            padding: 12px !important;
            box-sizing: border-box;
            flex-shrink: 0;
          }

          .customer-conversation-panel h3 {
            margin-bottom: 8px !important;
            font-size: 16px !important;
          }

          .customer-conversation-item {
            display: flex !important;
            padding: 8px !important;
            margin-bottom: 3px !important;
          }

          .customer-conversation-item .avatar {
            width: 34px !important;
            height: 34px !important;
          }

          .customer-conversation-panel .customer-conversation-info {
            min-width: 0;
          }

          .customer-conversation-panel .lastMessage {
            max-width: 100% !important;
          }

          .customer-chat-panel {
            min-height: 0 !important;
          }

          .customer-chat-header {
            padding: 12px 14px !important;
          }

          .customer-chat-header .avatar {
            width: 36px !important;
            height: 36px !important;
          }

          .customer-messages-area {
            padding: 13px !important;
          }

          .messageBubble {
            max-width: 82% !important;
            padding: 9px 12px !important;
            font-size: 12px !important;
          }

          .customer-message-input-area {
            gap: 7px !important;
            padding: 10px !important;
          }

          .customer-message-input {
            min-width: 0;
            padding: 10px !important;
            font-size: 13px;
          }

          .customer-send-button {
            padding: 10px 15px !important;
            flex-shrink: 0;
          }

          .customer-messages-page .noChat h3 {
            font-size: 16px;
          }

          .customer-messages-page .noChat p {
            font-size: 12px;
            text-align: center;
            padding: 0 20px;
          }
        }

        @media (max-width: 380px) {
          .customer-messages-page {
            padding: 18px 12px !important;
          }

          .customer-messages-title {
            font-size: 24px !important;
          }

          .customer-chat-container {
            height: 620px !important;
          }

          .customer-conversation-panel {
            height: 155px !important;
            max-height: 155px !important;
          }

          .customer-conversation-panel h3 {
            font-size: 15px !important;
          }

          .customer-conversation-item {
            padding: 7px !important;
          }

          .customer-chat-header {
            padding: 10px 12px !important;
          }

          .customer-messages-area {
            padding: 10px !important;
          }

          .messageBubble {
            max-width: 88% !important;
            font-size: 12px !important;
          }

          .customer-message-input-area {
            padding: 8px !important;
          }

          .customer-send-button {
            padding: 9px 12px !important;
          }
        }
      `}</style>
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
    boxSizing: "border-box",
  },

  conversationPanel: {
    width: "300px",
    borderRight: "1px solid #E5DFD5",
    padding: "20px",
    overflowY: "auto",
    boxSizing: "border-box",
    flexShrink: 0,
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
    minWidth: 0,
    boxSizing: "border-box",
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
    overflow: "hidden",
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
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },

  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 20px",
    borderBottom: "1px solid #E5DFD5",
    minWidth: 0,
    boxSizing: "border-box",
  },

  onlineText: {
    margin: "3px 0 0",
    fontSize: "11px",
    color: "#777",
  },

  messagesArea: {
    flex: 1,
    minHeight: 0,
    padding: "20px",
    overflowY: "auto",
    background: "#FCFBF9",
    boxSizing: "border-box",
  },

  messageRow: {
    display: "flex",
    marginBottom: "10px",
    minWidth: 0,
  },

  messageBubble: {
    maxWidth: "65%",
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "13px",
    minWidth: 0,
    overflowWrap: "anywhere",
    boxSizing: "border-box",
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
    whiteSpace: "nowrap",
  },

  emptyChat: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#999",
    fontSize: "13px",
    textAlign: "center",
  },

  noChat: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#777",
    textAlign: "center",
    padding: "20px",
    boxSizing: "border-box",
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
    boxSizing: "border-box",
    minWidth: 0,
  },

  messageInput: {
    flex: 1,
    minWidth: 0,
    padding: "11px 13px",
    border: "1px solid #DCD5CA",
    borderRadius: "8px",
    outline: "none",
    boxSizing: "border-box",
  },

  sendButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#174D40",
    color: "#FFFFFF",
    cursor: "pointer",
    flexShrink: 0,
  },
};

export default CustomerMessages;
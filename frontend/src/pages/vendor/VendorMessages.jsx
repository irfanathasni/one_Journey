import { useEffect, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import socket from "../../socket/socket";
import axiosInstance from "../../services/axiosInstance";
import VendorNavbar from "../../components/VendorNavbar";

const VendorMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [unreadCounts, setUnreadCounts] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await axiosInstance.get("/chat/conversations");
      setConversations(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (conversation) => {
    try {
      setSelectedConversation(conversation);

      setUnreadCounts((prev) => ({
        ...prev,
        [conversation._id]: 0,
      }));

      const res = await axiosInstance.get(`/chat/messages/${conversation._id}`);

      setMessages(res.data.data || []);

      socket.emit("joinConversation", conversation._id);
      socket.emit("markMessagesAsRead", conversation._id);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

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

        socket.emit("markMessagesAsRead", conversationId);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || 0) + 1,
        }));
      }

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                lastMessage:
                  newMessage.message ||
                  (newMessage.attachment?.type === "image"
                    ? "📷 Image"
                    : newMessage.attachment?.type === "video"
                      ? "🎥 Video"
                      : ""),
                lastMessageAt: newMessage.createdAt,
              }
            : conversation,
        ),
      );
    };

    const handleUserStatus = ({ userId, status }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [userId]: status === "online",
      }));
    };

    const handleMessagesRead = ({ conversationId }) => {
      if (conversationId !== selectedConversation?._id) return;

      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          isRead: true,
        })),
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
  }, [selectedConversation]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      alert("Only image and video files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50 MB.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    const previewUrl = URL.createObjectURL(file);

    setAttachmentPreview({
      url: previewUrl,
      type: file.type.startsWith("video/") ? "video" : "image",
      name: file.name,
    });

    e.target.value = "";
  };

  const removeAttachment = () => {
    if (attachmentPreview?.url) {
      URL.revokeObjectURL(attachmentPreview.url);
    }

    setSelectedFile(null);
    setAttachmentPreview(null);
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if ((!message.trim() && !selectedFile) || !selectedConversation) {
      return;
    }

    try {
      let attachment = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("attachment", selectedFile);

        const uploadResponse = await axiosInstance.post(
          "/chat/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        attachment = uploadResponse.data.data;
      }

      socket.emit("sendMessage", {
        conversationId: selectedConversation._id,
        message: message.trim(),
        attachment,
      });

      setMessage("");
      removeAttachment();
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to send message:", error);

      alert(
        error.response?.data?.message ||
          "Failed to send message. Please try again.",
      );
    }
  };

  const backToConversations = () => {
    setSelectedConversation(null);
    setMessages([]);
    removeAttachment();
    setShowEmojiPicker(false);
  };

  return (
    <>
      <VendorNavbar />

      <div className="responsive-page vendor-messages-page" style={styles.page}>
        <div className="vendor-messages-header" style={styles.header}>
          <p style={styles.eyebrow}>MESSAGES</p>
          <h1 className="vendor-messages-title" style={styles.title}>
            Messages
          </h1>
          <p className="vendor-messages-subtitle" style={styles.subtitle}>
            Chat with your customers.
          </p>
        </div>

        <div
          className={`chat-container ${
            selectedConversation ? "mobile-chat-selected" : "mobile-chat-list"
          }`}
          style={styles.chatContainer}
        >
          <div className="conversation-panel" style={styles.conversationPanel}>
            <h3 style={styles.panelTitle}>Conversations</h3>
            {loading ? (
              <p style={styles.emptyText}>Loading...</p>
            ) : conversations.length === 0 ? (
              <p style={styles.emptyText}>No conversations yet.</p>
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
                    {conversation.customer?.name?.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.conversationTop}>
                      <strong
                        className="conversation-name"
                        style={styles.conversationName}
                      >
                        {conversation.customer?.name || "Customer"}
                      </strong>

                      {unreadCounts[conversation._id] > 0 && (
                        <span style={styles.unreadBadge}>
                          {unreadCounts[conversation._id]}
                        </span>
                      )}
                    </div>

                    <p style={styles.lastMessage}>
                      {conversation.lastMessage || "Start chatting"}
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
                <p>Choose a customer to start chatting.</p>
              </div>
            ) : (
              <>
                <div
                  className="mobile-back-button"
                  onClick={backToConversations}
                >
                  ← Conversations
                </div>

                <div className="vendor-chat-header" style={styles.chatHeader}>
                  <div style={styles.avatar}>
                    {selectedConversation.customer?.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div style={styles.chatHeaderInfo}>
                    <strong
                      className="chat-customer-name"
                      style={styles.chatCustomerName}
                    >
                      {selectedConversation.customer?.name || "Customer"}
                    </strong>

                    <p
                      style={{
                        ...styles.onlineText,
                        color: onlineUsers[selectedConversation.customer?._id]
                          ? "#2E8B57"
                          : "#999",
                      }}
                    >
                      {onlineUsers[selectedConversation.customer?._id]
                        ? "● Online"
                        : "○ Offline"}
                    </p>
                  </div>
                </div>

                <div className="messages-area" style={styles.messagesArea}>
                  {messages.length === 0 ? (
                    <div style={styles.emptyChat}>
                      No messages yet. Say hello 👋
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine =
                        msg.sender?._id?.toString() ===
                        selectedConversation.vendor?._id?.toString();

                      return (
                        <div
                          key={msg._id}
                          className={`vendor-message-row ${
                            isMine ? "my-message-row" : "their-message-row"
                          }`}
                        >
                          <div
                            className="message-bubble"
                            style={{
                              ...styles.messageBubble,
                              ...(isMine
                                ? styles.myMessage
                                : styles.theirMessage),
                            }}
                          >
                            {msg.attachment?.url && (
                              <div className="message-attachment">
                                {msg.attachment.type === "image" ? (
                                  <img
                                    src={msg.attachment.url}
                                    alt={msg.attachment.name || "Attachment"}
                                    className="chat-image"
                                  />
                                ) : (
                                  <video
                                    src={msg.attachment.url}
                                    controls
                                    className="chat-video"
                                  />
                                )}
                              </div>
                            )}

                            {/* TEXT */}

                            {msg.message && (
                              <div className="message-text">{msg.message}</div>
                            )}

                            <span style={styles.messageTime}>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}

                              {isMine && (
                                <span
                                  style={{
                                    marginLeft: "5px",
                                  }}
                                >
                                  {msg.isRead ? "✓✓" : "✓"}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {attachmentPreview && (
                  <div className="attachment-preview">
                    <div className="attachment-preview-content">
                      {attachmentPreview.type === "image" ? (
                        <img src={attachmentPreview.url} alt="Preview" />
                      ) : (
                        <video src={attachmentPreview.url} controls />
                      )}

                      <div className="attachment-info">
                        <span>{attachmentPreview.name}</span>

                        <button type="button" onClick={removeAttachment}>
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <form
                  onSubmit={sendMessage}
                  className="vendor-message-input-area"
                  style={styles.inputArea}
                >
                  <div className="emoji-wrapper">
                    <button
                      type="button"
                      className="emoji-button"
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                    >
                      😊
                    </button>

                    {showEmojiPicker && (
                      <div className="emoji-picker-container">
                        <EmojiPicker
                          onEmojiClick={handleEmojiClick}
                          width={300}
                          height={350}
                        />
                      </div>
                    )}
                  </div>

                  <label
                    htmlFor="vendor-chat-file"
                    className="attachment-button"
                    title="Attach image or video"
                  >
                    📎
                  </label>

                  <input
                    id="vendor-chat-file"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />

                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={styles.messageInput}
                  />

                  {/* SEND */}

                  <button type="submit" style={styles.sendButton}>
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* =========================
            RESPONSIVE CSS
        ========================= */}

        <style>{`
          /* =========================
             MESSAGE ALIGNMENT
          ========================= */

          .vendor-message-row {
            display: flex;
            width: 100%;
            margin-bottom: 10px;
            box-sizing: border-box;
          }

          .their-message-row {
            justify-content: flex-start !important;
          }

          .my-message-row {
            justify-content: flex-end !important;
          }

          .message-bubble {
            width: fit-content;
            max-width: 65%;
          }

          .message-text {
            white-space: pre-wrap;
          }

          /* =========================
             ATTACHMENTS
          ========================= */

          .message-attachment {
            margin-bottom: 5px;
          }

          .chat-image {
            display: block;
            max-width: 250px;
            max-height: 250px;
            width: auto;
            height: auto;
            border-radius: 8px;
            object-fit: cover;
          }

          .chat-video {
            display: block;
            width: 250px;
            max-width: 100%;
            max-height: 250px;
            border-radius: 8px;
            object-fit: cover;
          }

          /* =========================
             ATTACHMENT PREVIEW
          ========================= */

          .attachment-preview {
            padding: 10px 15px;
            border-top: 1px solid #E5DFD5;
            background: #FFFFFF;
          }

          .attachment-preview-content {
            position: relative;
            display: inline-flex;
            flex-direction: column;
            max-width: 180px;
            border: 1px solid #E5DFD5;
            border-radius: 9px;
            overflow: hidden;
            background: #FCFBF9;
          }

          .attachment-preview-content img,
          .attachment-preview-content video {
            width: 180px;
            height: 120px;
            object-fit: cover;
          }

          .attachment-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            padding: 6px 8px;
            font-size: 10px;
            color: #555;
          }

          .attachment-info span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 140px;
          }

          .attachment-info button {
            border: none;
            background: transparent;
            color: #C97B84;
            cursor: pointer;
            font-size: 13px;
          }

          /* =========================
             EMOJI
          ========================= */

          .emoji-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .emoji-button,
          .attachment-button {
            width: 36px;
            height: 36px;
            border: none;
            background: transparent;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 19px;
            flex-shrink: 0;
          }

          .attachment-button {
            color: #3D5A50;
            font-size: 20px;
          }

          .emoji-picker-container {
            position: absolute;
            bottom: 45px;
            left: 0;
            z-index: 1000;
          }

          /* =========================
             TABLET
          ========================= */

          @media (max-width: 900px) {
            .vendor-messages-page {
              padding: 30px 24px !important;
            }

            .conversation-panel {
              width: 260px !important;
              flex-shrink: 0;
            }

            .message-bubble {
              max-width: 75% !important;
            }

            .chat-image {
              max-width: 220px;
              max-height: 220px;
            }

            .chat-video {
              width: 220px;
              max-height: 220px;
            }
          }

          /* =========================
             MOBILE
          ========================= */

          @media (max-width: 700px) {
            .vendor-messages-page {
              padding: 24px 16px !important;
            }

            .vendor-messages-title {
              font-size: 28px !important;
            }

            .vendor-messages-subtitle {
              font-size: 12px !important;
            }

            .chat-container {
              height: calc(100vh - 190px) !important;
              min-height: 500px;
              position: relative;
            }

            .mobile-chat-list .conversation-panel {
              width: 100% !important;
              border-right: none !important;
              display: block !important;
            }

            .mobile-chat-list .chat-panel {
              display: none !important;
            }

            .mobile-chat-selected .conversation-panel {
              display: none !important;
            }

            .mobile-chat-selected .chat-panel {
              display: flex !important;
              width: 100% !important;
            }

            .conversation-panel {
              padding: 16px !important;
            }

            .panelTitle {
              font-size: 17px !important;
            }

            .conversation {
              padding: 11px !important;
            }

            .conversation-name {
              font-size: 13px;
            }

            .lastMessage {
              max-width: 100% !important;
            }

            .vendor-chat-header {
              padding: 13px 15px !important;
            }

            .chat-customer-name {
              font-size: 13px;
            }

            .messages-area {
              padding: 14px !important;
            }

            .message-bubble {
              max-width: 82% !important;
              padding: 9px 12px !important;
              font-size: 12px !important;
            }

            .chat-image {
              max-width: 180px;
              max-height: 180px;
            }

            .chat-video {
              width: 180px;
              max-height: 180px;
            }

            .vendor-message-input-area {
              padding: 10px !important;
              gap: 4px !important;
            }

            .vendor-message-input-area input {
              min-width: 0;
              padding: 10px !important;
            }

            .vendor-message-input-area button[type="submit"] {
              padding: 10px 13px !important;
            }

            .emoji-button,
            .attachment-button {
              width: 32px;
              height: 32px;
              font-size: 17px;
            }

            .emoji-picker-container {
              position: fixed;
              bottom: 65px;
              left: 50%;
              transform: translateX(-50%);
            }

            .attachment-preview {
              padding: 8px 10px;
            }

            .attachment-preview-content img,
            .attachment-preview-content video {
              width: 140px;
              height: 95px;
            }

            .mobile-back-button {
              display: block !important;
            }
          }

          /* =========================
             SMALL MOBILE
          ========================= */

          @media (max-width: 380px) {
            .vendor-messages-page {
              padding: 20px 12px !important;
            }

            .vendor-messages-title {
              font-size: 25px !important;
            }

            .chat-container {
              height: calc(100vh - 175px) !important;
              min-height: 460px;
            }

            .conversation-panel {
              padding: 13px !important;
            }

            .conversation {
              gap: 9px !important;
              padding: 10px !important;
            }

            .conversation .avatar {
              width: 36px !important;
              height: 36px !important;
              font-size: 13px !important;
            }

            .messages-area {
              padding: 11px !important;
            }

            .message-bubble {
              max-width: 88% !important;
            }

            .chat-image {
              max-width: 150px;
              max-height: 150px;
            }

            .chat-video {
              width: 150px;
              max-height: 150px;
            }

            .vendor-message-input-area {
              padding: 8px !important;
            }

            .vendor-message-input-area button[type="submit"] {
              padding: 10px 11px !important;
            }

            .emoji-button,
            .attachment-button {
              width: 28px;
              font-size: 16px;
            }
          }

          /* =========================
             BACK BUTTON
          ========================= */

          .mobile-back-button {
            display: none;
            padding: 10px 15px;
            border-bottom: 1px solid #E5DFD5;
            background: #FFFFFF;
            color: #3D5A50;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }
        `}</style>
      </div>
    </>
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
    boxSizing: "border-box",
  },

  selectedConversation: {
    background: "#F5E9E8",
  },

  conversationTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  },

  conversationName: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  unreadBadge: {
    minWidth: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#C97B84",
    color: "#FFFFFF",
    fontSize: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    flexShrink: 0,
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
    minWidth: 0,
  },

  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "15px 20px",
    borderBottom: "1px solid #E5DFD5",
    flexShrink: 0,
  },

  chatHeaderInfo: {
    minWidth: 0,
  },

  chatCustomerName: {
    overflowWrap: "anywhere",
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
    minHeight: 0,
  },

  messageBubble: {
    maxWidth: "65%",
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "13px",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },

  myMessage: {
    background: "#3D5A50",
    color: "#FFFFFF",
    borderBottomRightRadius: "3px",
  },

  theirMessage: {
    background: "#FFFFFF",
    color: "#333333",
    border: "1px solid #E5DFD5",
    borderBottomLeftRadius: "3px",
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
  },

  chatIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  inputArea: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "15px",
    borderTop: "1px solid #E5DFD5",
    flexShrink: 0,
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

export default VendorMessages;

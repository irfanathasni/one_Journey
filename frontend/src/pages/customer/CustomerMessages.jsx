import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import EmojiPicker from "emoji-picker-react";

import socket from "../../socket/socket";
import axiosInstance from "../../services/axiosInstance";

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

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

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
    if (!selectedConversation?._id) return;

    socket.emit(
      "joinConversation",
      selectedConversation._id
    );

    socket.emit(
      "markMessagesAsRead",
      selectedConversation._id
    );
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
          const alreadyExists = prev.some(
            (msg) => msg._id === newMessage._id
          );

          if (alreadyExists) {
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
                  newMessage.message ||
                  (newMessage.attachment?.type ===
                  "image"
                    ? "📷 Image"
                    : newMessage.attachment?.type ===
                      "video"
                    ? "🎥 Video"
                    : ""),

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

    socket.on("userStatusChanged",handleUserStatus);
    socket.on("messagesRead",handleMessagesRead);

    return () => {
      socket.off("receiveMessage",handleReceiveMessage);
      socket.off("userStatusChanged",handleUserStatus);
      socket.off("messagesRead",handleMessagesRead);
    };
  }, [
    selectedConversation,
    user?._id,
  ]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo =file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Only image and video files are allowed");
      e.target.value = "";
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("File size should be less than 50MB");

      e.target.value = "";
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);

    setSelectedFile(file);
    setPreviewUrl(url);
  };

  const removeSelectedFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage(
      (prev) => prev + emojiData.emoji
    );
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!selectedConversation) {
      return;
    }

    if (
      !message.trim() &&
      !selectedFile
    ) {
      return;
    }

    try {
      setUploading(true);

      let attachment = null;

      if (selectedFile) {
        const formData = new FormData();

        formData.append(
          "attachment",
          selectedFile
        );

        const response =
          await axiosInstance.post(
            "/chat/upload",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        attachment =
          response.data.data;
      }

      console.log(
        "Sending message:",
        {
          conversationId:
            selectedConversation._id,

          message: message.trim(),

          attachment,
        }
      );

      // Send through Socket.IO
      socket.emit("sendMessage", {
        conversationId:
          selectedConversation._id,

        message: message.trim(),

        attachment,
      });

      setMessage("");

      removeSelectedFile();

      setShowEmojiPicker(false);
    } catch (error) {
      console.error(
        "Failed to send message:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to send message"
      );
    } finally {
      setUploading(false);
    }
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
        <p style={styles.eyebrow}>
          MESSAGES
        </p>

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


      <div
        className="chat-container customer-chat-container"
        style={styles.chatContainer}
      >

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
            conversations.map(
              (conversation) => (
                <div
                  key={conversation._id}
                  onClick={() =>
                    openConversation(
                      conversation
                    )
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
                  <div
                    style={styles.avatar}
                  >
                    {conversation.vendor?.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div
                    style={
                      styles.conversationInfo
                    }
                    className="customer-conversation-info"
                  >
                    <strong>
                      {conversation.vendor
                        ?.name ||
                        "Vendor"}
                    </strong>

                    <p
                      style={
                        styles.lastMessage
                      }
                    >
                      {conversation.lastMessage ||
                        "Start chatting"}
                    </p>
                  </div>
                </div>
              )
            )
          )}
        </div>


        <div
          className="chat-panel customer-chat-panel"
          style={styles.chatPanel}
        >
          {!selectedConversation ? (
            <div style={styles.noChat}>
              <div
                style={styles.chatIcon}
              >
                💬
              </div>

              <h3>
                Select a conversation
              </h3>

              <p>
                Choose a vendor to start
                chatting.
              </p>
            </div>
          ) : (
            <>

              <div
                style={styles.chatHeader}
                className="customer-chat-header"
              >
                <div
                  style={styles.avatar}
                >
                  {selectedConversation
                    .vendor?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div className="customer-chat-header-info">
                  <strong>
                    {selectedConversation
                      .vendor?.name ||
                      "Vendor"}
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
                      selectedConversation
                        .vendor?._id
                    ]
                      ? "● Online"
                      : "○ Offline"}
                  </p>
                </div>
              </div>

              <div
                className="messagesArea customer-messages-area"
                style={styles.messagesArea}
              >
                {messages.length === 0 ? (
                  <div
                    style={
                      styles.emptyChat
                    }
                  >
                    No messages yet.
                    <br />
                    Say hello 👋
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderId =
                      msg.sender?._id ||
                      msg.sender;

                    const isMine =
                      senderId
                        ?.toString() ===
                      user?._id?.toString();

                    return (
                      <div
                        key={msg._id}
                        className={`customer-message-row ${
                          isMine
                            ? "my-message-row"
                            : "their-message-row"
                        }`}
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
                          {/* ATTACHMENT */}

                          {msg.attachment
                            ?.url && (
                            <div className="message-attachment">
                              {msg
                                .attachment
                                .type ===
                              "image" ? (
                                <img
                                  src={
                                    msg
                                      .attachment
                                      .url
                                  }
                                  alt={
                                    msg
                                      .attachment
                                      .name ||
                                    "Attachment"
                                  }
                                  className="message-attachment-image"
                                />
                              ) : (
                                <video
                                  src={
                                    msg
                                      .attachment
                                      .url
                                  }
                                  controls
                                  className="message-attachment-video"
                                />
                              )}
                            </div>
                          )}

                          {/* TEXT */}

                          {msg.message && (
                            <div className="customer-message-text">
                              {
                                msg.message
                              }
                            </div>
                          )}

                          {/* TIME */}

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
                                minute:
                                  "2-digit",
                              }
                            )}

                            {/* READ RECEIPT */}

                            {isMine && (
                              <span
                                style={{
                                  marginLeft:
                                    "5px",
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

              {selectedFile && (
                <div className="attachment-preview">
                  {selectedFile.type.startsWith(
                    "image/"
                  ) ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="attachment-preview-image"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="attachment-preview-video"
                    />
                  )}

                  <div className="attachment-preview-info">
                    <span>
                      {selectedFile.name}
                    </span>

                    <button
                      type="button"
                      onClick={
                        removeSelectedFile
                      }
                      title="Remove attachment"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <form
                onSubmit={sendMessage}
                className="inputArea customer-message-input-area"
                style={styles.inputArea}
              >

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*"
                  onChange={
                    handleFileChange
                  }
                  style={{
                    display: "none",
                  }}
                />


                <button
                  type="button"
                  className="chat-action-button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  title="Attach image or video"
                >
                  📎
                </button>


                <div className="emoji-wrapper">
                  <button
                    type="button"
                    className="chat-action-button"
                    onClick={() =>
                      setShowEmojiPicker(
                        (prev) => !prev
                      )
                    }
                    title="Add emoji"
                  >😊
                  </button>

                  {showEmojiPicker && (
                    <div className="emoji-picker-container">
                      <EmojiPicker
                        onEmojiClick={
                          handleEmojiClick
                        }
                        width={300}
                        height={350}
                      />
                    </div>
                  )}
                </div>

                <input
                  className="messageInput customer-message-input"
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  placeholder="Type a message..."
                  style={
                    styles.messageInput
                  }
                />

                <button
                  type="submit"
                  className="sendButton customer-send-button"
                  style={
                    styles.sendButton
                  }
                  disabled={uploading}
                >
                  {uploading
                    ? "Uploading..."
                    : "Send"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`

        .customer-message-row {
          display: flex;
          width: 100%;
          margin-bottom: 10px;
          box-sizing: border-box;
        }

        /* RECEIVED = LEFT */

        .their-message-row {
          justify-content: flex-start !important;
        }

        /* SENT = RIGHT */

        .my-message-row {
          justify-content: flex-end !important;
        }

        .messageBubble {
          width: fit-content;
          max-width: 65%;
        }


        .chat-action-button {
          width: 40px;
          height: 40px;
          border: 1px solid #DCD5CA;
          border-radius: 8px;
          background: #FFFFFF;
          cursor: pointer;
          font-size: 18px;
          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-action-button:hover {
          background: #F5E9E8;
        }

        .emoji-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .emoji-picker-container {
          position: absolute;
          bottom: 50px;
          left: 0;
          z-index: 100;
        }

        .attachment-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 15px;
          background: #FCFBF9;
          border-top: 1px solid #E5DFD5;
        }

        .attachment-preview-image,
        .attachment-preview-video {
          width: 75px;
          height: 75px;
          object-fit: cover;
          border-radius: 8px;
        }

        .attachment-preview-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          min-width: 0;
          flex: 1;
        }

        .attachment-preview-info span {
          font-size: 12px;
          color: #666;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .attachment-preview button {
          border: none;
          background: #C97B84;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          flex-shrink: 0;
        }

        .message-attachment {
          margin-bottom: 5px;
        }

        .message-attachment-image,
        .message-attachment-video {
          display: block;
          max-width: 240px;
          max-height: 300px;
          border-radius: 8px;
          object-fit: cover;
        }

        .message-attachment-video {
          background: #000;
        }

        .customer-message-text {
          line-height: 1.45;
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* ============================== */
        /* TABLET */
        /* ============================== */

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

          .messageBubble {
            max-width: 70% !important;
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

       /* ============================== */
/* MOBILE */
/* ============================== */

@media (max-width: 600px) {
  .customer-messages-page {
    padding: 18px 12px !important;
    min-height: 100vh !important;
  }

  .customer-messages-header {
    margin-bottom: 15px !important;
  }

  .customer-messages-title {
    font-size: 27px !important;
  }

  .customer-chat-container {
    width: 100% !important;
    height: calc(100vh - 155px) !important;
    min-height: 520px !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }

  .customer-conversation-panel {
    width: 100% !important;
    height: 145px !important;
    min-height: 145px !important;
    max-height: 145px !important;
    padding: 10px !important;
    box-sizing: border-box;
    flex-shrink: 0 !important;
    border-right: none !important;
    border-bottom: 1px solid #E5DFD5;
    overflow-y: auto;
  }

  .customer-conversation-panel h3 {
    margin-bottom: 7px !important;
    font-size: 16px !important;
  }

  .customer-conversation-item {
    padding: 7px !important;
    margin-bottom: 3px !important;
  }

  .customer-conversation-info {
    min-width: 0 !important;
    overflow: hidden !important;
  }

  .customer-conversation-info strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .customer-chat-panel {
    flex: 1 !important;
    min-height: 0 !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }

  .customer-chat-header {
    padding: 10px 12px !important;
    flex-shrink: 0 !important;
  }

  .customer-messages-area {
    flex: 1 !important;
    min-height: 0 !important;
    padding: 10px !important;
    overflow-y: auto !important;
  }

  .messageBubble {
    max-width: 82% !important;
    padding: 9px 12px !important;
    font-size: 12px !important;
  }

  .message-attachment-image,
  .message-attachment-video {
    max-width: 190px !important;
    max-height: 240px !important;
  }

  .attachment-preview {
    padding: 7px 10px !important;
    flex-shrink: 0 !important;
  }

  .attachment-preview-image,
  .attachment-preview-video {
    width: 55px !important;
    height: 55px !important;
  }

  /* MESSAGE INPUT */
  .customer-message-input-area {
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 8px !important;
    flex-shrink: 0 !important;
    box-sizing: border-box !important;
  }

  .chat-action-button {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    font-size: 16px !important;
  }

  .customer-message-input {
    flex: 1 !important;
    width: 100% !important;
    min-width: 0 !important;
    padding: 9px 10px !important;
    font-size: 13px !important;
  }

  .customer-send-button {
    padding: 9px 12px !important;
    min-width: 52px !important;
    white-space: nowrap !important;
  }

  .emoji-picker-container {
    left: auto !important;
    right: 0 !important;
    bottom: 45px !important;
  }
}

@media (max-width: 380px) {
  .customer-messages-page {
    padding: 15px 8px !important;
  }

  .customer-messages-title {
    font-size: 24px !important;
  }

  .customer-chat-container {
    height: calc(100vh - 140px) !important;
    min-height: 500px !important;
  }

  .customer-conversation-panel {
    height: 130px !important;
    min-height: 130px !important;
    max-height: 130px !important;
    padding: 8px !important;
  }

  .customer-conversation-panel h3 {
    font-size: 14px !important;
  }

  .customer-conversation-item {
    padding: 6px !important;
  }

  .customer-chat-header {
    padding: 8px 10px !important;
  }

  .customer-messages-area {
    padding: 8px !important;
  }

  .messageBubble {
    max-width: 88% !important;
    font-size: 12px !important;
    padding: 8px 10px !important;
  }

  .customer-message-input-area {
    gap: 4px !important;
    padding: 6px !important;
  }

  .chat-action-button {
    width: 34px !important;
    height: 34px !important;
    min-width: 34px !important;
    font-size: 15px !important;
  }

  .customer-message-input {
    padding: 8px !important;
    font-size: 12px !important;
  }

  .customer-send-button {
    padding: 8px 9px !important;
    min-width: 48px !important;
    font-size: 12px !important;
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
  },

  messagesArea: {
    flex: 1,
    minHeight: 0,
    padding: "20px",
    overflowY: "auto",
    background: "#F8F6F2",
    boxSizing: "border-box",
  },

  messageRow: {
    display: "flex",
    width: "100%",
    marginBottom: "10px",
    minWidth: 0,
    boxSizing: "border-box",
  },

  messageBubble: {
    width: "fit-content",
    maxWidth: "65%",
    padding: "10px 14px",
    borderRadius: "14px",
    fontSize: "13px",
    minWidth: "70px",
    overflowWrap: "anywhere",
    boxSizing: "border-box",
    boxShadow:
      "0 1px 3px rgba(0,0,0,0.05)",
  },

  myMessage: {
    background: "#3D5A50",
    color: "#FFFFFF",
    borderBottomRightRadius: "4px",
  },

  theirMessage: {
    background: "#FFFFFF",
    color: "#333333",
    border: "1px solid #E5DFD5",
    borderBottomLeftRadius: "4px",
  },

  messageTime: {
    display: "block",
    fontSize: "9px",
    marginTop: "5px",
    opacity: 0.65,
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
    alignItems: "center",
    gap: "10px",
    padding: "15px",
    borderTop: "1px solid #E5DFD5",
    background: "#FFFFFF",
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


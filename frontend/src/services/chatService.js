import axiosInstance from "./axiosInstance";

export const getOrCreateConversation = async (vendorId) => {
  const res = await axiosInstance.post("/chat/conversation", {vendorId});
  return res.data;
}

export const getMyConversations = async () => {
  const res = await axiosInstance.get("/chat/conversations");
  return res.data;
}

export const getMessages = async (conversationId) => {
  const res = await axiosInstance.get(`/chat/messages/${conversationId}`)
  return res.data;
}



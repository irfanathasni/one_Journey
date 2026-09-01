import axiosInstance from "./axiosInstance";

export const getActiveCategories = async () => {
  return await axiosInstance.get("/categories");
}
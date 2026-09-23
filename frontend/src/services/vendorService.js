import axiosInstance from "./axiosInstance";

export const createVendorProfile = async (data) => {
  const res = await axiosInstance.post("/vendor/create", data);
  return res.data;
};
export const getMyVendorProfile = async () => {
  const res = await axiosInstance.get("/vendor/my-profile");
  return res.data;
};
export const getVendors = async (category = "") => {
  const res = await axiosInstance.get("/vendor", {
    params: category ? { category } : {},
  });
  return res.data;
};

export const updateVendorProfile = async (data) => {
  const res = await axiosInstance.put("/vendor/update-profile", data);
  return res.data;
};

export const getVendorAvailability = async (vendorId, fromDate, toDate) => {
  const res = await axiosInstance.get(`/vendor/${vendorId}/availability`, {
    params: {
      fromDate,
      toDate,
    },
  });

  return res.data;
};

export const createAvailability = async (data) => {
  const res = await axiosInstance.post("/vendor/availability", data);
  return res.data;
};

export const getMyAvailability = async (params = {}) => {
  const res = await axiosInstance.get("/vendor/availability", {
    params,
  });
  return res.data;
};

export const deleteAvailability = async (slotId) => {
  const res = await axiosInstance.delete(`/vendor/availability/${slotId}`);
  return res.data;
};

export const addPackage = async (data) => {
  const res = await axiosInstance.post("/vendor/packages", data);
  return res.data;
};

export const updatePackage = async (packageId, data) => {
  const res = await axiosInstance.put(`/vendor/packages/${packageId}`, data);
  return res.data;
};

export const deletePackage = async (packageId) => {
  const res = await axiosInstance.delete(`/vendor/packages/${packageId}`);
  return res.data;
};

export const setupVendorPayout = async (data) => {
  const res = await axiosInstance.post("/vendor/payout/setup", data);
  return res.data;
};

const axios = require("axios");
const crypto = require("crypto");

const razorpayXClient = axios.create({
  baseURL: process.env.RAZORPAYX_BASE_URL,
  auth: {
    username: process.env.RAZORPAY_KEY_ID,
    password: process.env.RAZORPAY_KEY_SECRET,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

const createPayout = async ({ fundAccountId, amount, referenceId }) => {
  const idempotencyKey = crypto.randomUUID();

  const payload = {
    account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
    fund_account_id: fundAccountId,
    amount: Math.round(amount * 100),
    currency: "INR",
    mode: "IMPS",
    purpose: "payout",
    queue_if_low_balance: true,
    reference_id: referenceId,
    narration: "Vendor wallet payout",
  };

  const response = await razorpayXClient.post("/payouts", payload, {
    headers: {
      "X-Payout-Idempotency": idempotencyKey,
    },
  });

  return response.data;
};

const createContact = async ({ name, email, contact, referenceId }) => {
  const response = await razorpayXClient.post("/contacts", {
    name,
    email,
    contact,
    type: "vendor",
    reference_id: referenceId,
  });

  return response.data;
};

const createFundAccount = async ({
  contactId,
  accountHolderName,
  accountNumber,
  ifsc,
}) => {
  const response = await razorpayXClient.post("/fund_accounts", {
    contact_id: contactId,
    account_type: "bank_account",
    bank_account: {
      name: accountHolderName,
      ifsc,
      account_number: accountNumber,
    },
  });

  return response.data;
};

module.exports = {
  createPayout,
  createContact,
  createFundAccount,
};

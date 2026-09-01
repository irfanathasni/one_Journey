const Wallet = require("../models/Wallet")
const Vendor = require("../models/Vendor")

const getMyWallet = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user.id })
        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor profile not found" })
        }
        let wallet = await Wallet.findOne({ vendor: vendor._id })
        if (!wallet) {
            wallet = await Wallet.create({ vendor: vendor._id, balance: 0, transactions: [] })
        }
        return res.status(200).json({ success: true, data: wallet })
    } catch (error) {
        next(error)
    }
}

const withdrawFromWallet = async (req, res, next) => {
    try {
        const { amount } = req.body
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Enter a valid withdrawal amount" })
        }
        const vendor = await Vendor.findOne({ user: req.user.id })
        if (!vendor) {
            return res.status(404).json({ success: false, message: "Vendor profile not found" })
        }
        const wallet = await Wallet.findOne({ vendor: vendor._id })
        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient wallet balance" })
        }

        wallet.balance -= amount
        wallet.transactions.unshift({
            type: "withdrawal",
            amount,
            description: "Withdrawal to bank account"
        })
        await wallet.save()

        return res.status(200).json({ success: true, message: "Withdrawal successful", data: wallet })
    } catch (error) {
        next(error)
    }
}

module.exports = { getMyWallet, withdrawFromWallet }
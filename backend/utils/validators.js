const isValidEmail = (email) => {
    const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
}

const isValidPassword = (password) => {
    return password.length >=6
}
module.exports = { isValidEmail , isValidPhone ,isValidPassword}
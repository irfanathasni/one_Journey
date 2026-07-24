export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
}

export const isValidPassword = (password) => {
    return password.length >= 6
}
const isValidEmail = (email) => {
    const emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone)
}

const isValidPassword = (password) => {
    const passwordRegex =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d@$!%*?&.#^()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/
    return passwordRegex.test(password)
}

const isValidName =(name) => {
    const nameRegex = /^[A-Za-z ]{3,50}$/
    return nameRegex.test(name.trim())
}
module.exports = { isValidEmail , isValidPhone ,isValidPassword ,isValidName}
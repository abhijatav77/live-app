import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
    return jwt.sign(
        {userId},
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXEPIRES_IN
        }
    )
}

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        throw new Error("Invalid or expired token")
    }
}
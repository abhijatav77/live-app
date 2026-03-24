import User from "../model/User.js";
import { generateToken } from "../utils/jwt.js";


export const register = async(req, res, next) => {
    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const userExist = await User.findOne({email})
        if(userExist){
            return res.status(400).json({
                success: false,
                message: "User already registered"
            })
        }

        const user = await User.create({
            name,
            email,
            password
        })
        
        //generate token
        const token = generateToken(user._id)

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id:user._id,
                    name:user.name,
                    email:user.email,
                },
                token,
            },
            message: "User registered successfully",
        })
    } catch (error) {
        next(error)
    }
}

export const login = async(req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const user = await User.findOne({email}).select('+password')
        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        //check if password match
        const isPasswordMatch = await user.matchPassword(password)
        if(!isPasswordMatch){
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            })
        }

        const token = generateToken(user._id)

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id:user._id,
                    name:user.name,
                    email:user.email,
                },
                token
            },
            message: "User registered successfully"
        })
    } catch (error) {
        next(error)
    }
}

export const getMe = async(req, res, next) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id:user._id,
                    name:user.name,
                    email:user.email
                }
            },
            Message: "User get successfully"
        })
    } catch (error) {
        next(error)
    }
}
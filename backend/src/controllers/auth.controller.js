import bcrypt from "bcryptjs"
import User from "../models/User.js"
import { generateToken } from "../lib/utils.js"
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import 'dotenv/config'

export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;

    try {
        //check all fields
        if(!fullName || !email || !password){
            return res.status(400).json({message: 'All fields are required'})
        }

        //check password lenght
        if(password.length < 6){
            return res.status(400).json({message: 'Password must be atleat 6 characters'})
        }

        //check valid email
        const emailRegix = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if(!emailRegix.test(email)){
            return res.status(400).json({message: 'Invalid email'})
        }

        //check user already exist
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: 'User already exist'})
        }

        //hash password and create user
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        
        const newUser = new User({
            fullName, 
            email,
            password : hashedPassword
        })

        if(newUser){
            const savedUser = await newUser.save();
            generateToken(savedUser._id, res);
            
            res.status(201).json({
                _id: newUser._id, 
                fullName: newUser.fullName,
                email: newUser.email, 
                profilePic: newUser.profilePic
            })

            try {
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, process.env.CLIENT_URL)
            } catch (error) {
                console.error("Failed to send welcome email: ", error)
            }
        }else{
            return res.status(400).json({message : 'Invalid user data, Account cannot be created'})
        }
    } catch (err) {
        console.log("Signup Error: ", err)
        return res.status(500).json({message : "Internal server error"})
    }
}


import mongoose from "mongoose";
import bcryptjs from 'bcryptjs'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxLength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        trim: true,
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minLength: [6, 'Password must be at least 6 characters'],
        select: false
    }
},{timestamps: true})


userSchema.pre('save', async function() {
    if(!this.isModified('password')){
        return;
    }

    const salt = await bcryptjs.genSalt(12)
    this.password = await bcryptjs.hash(this.password, salt);
})

userSchema.methods.matchPassword = async function(enteredPassword){
    return await bcryptjs.compare(enteredPassword, this.password)
}


export default mongoose.model('User', userSchema)
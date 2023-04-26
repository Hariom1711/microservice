const express =require("express");
const app =express();
const DB=`mongodb+srv://Hariomojha1711:Hariom1711@cluster0.c0pfwpt.mongodb.net/?retryWrites=true&w=majority`
const PORT=process.env.PORT_ONE || 7070;
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const User = require('./User')

mongoose.connect(DB,{
    // useCreateIndex:true,
    // useFindAndModify:false,
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    try{
        console.log("Auth service connection start");
    }
    catch(e){
        console.log("error:",e)
    }
})

app.use(cors());
app.use(express.json());

// login 
// Register

app.post("/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ message: "User doesn't exist" });
    } else {
        // check if password is right
        if (password !== user.password) {
            return res.json({ message: "Password Incorrect" });
        }
        const payload = {
            email,
            name: user.name
        };
        jwt.sign(payload, "secret", (err, token) => {
            if (err) console.log(err);
            else return res.json({ token: token });
        });
    }
});

app.post("/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.json({ message: "User already exists" });
    } else {
        const newUser = new User({
            email,
            name,
            password,
        });
        newUser.save();
        return res.json(newUser);
    }
});
app.listen(PORT,()=>{
console.log(`Auth service at ${PORT}`)
})
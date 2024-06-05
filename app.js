const express = require("express")
const app = express()
const path = require("path");
const userModel = require("./models/user")
const userPost = require("./models/post")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const ejs = require("ejs")
const bcrypt = require("bcrypt")
app.set("view engine", "ejs")
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())


app.get('/',(req,res)=>{
res.render("index")

})

app.get('/login',(req,res)=>{
    res.render("login")
    
    })

app.get("/profile",isLoggedIn,(req,res)=>{
    console.log(req.user)
})   
    

app.post('/create', async(req,res)=>{
let {email,age,name,username,password} = req.body
   let user = await userModel.findOne({email})
   if(user) return  res.status(500).send("user already exist")
   
   bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(password,salt , async (err,hash) =>{
      let user =  await userModel.create({
        username,
        email,
        age,
        name,
        password: hash

        });

        let token = jwt.sign({email:email , userid: user._id},"secret")
        res.cookie("token",token)
        res.send("user created")


    })
   })

})

app.post("/login",async (req,res)=>{
    const {email , password} = req.body
   let user = await userModel.findOne({email})
   if(!user){
    return res.send("Something went wrong")
   }

   bcrypt.compare(password,user.password,(err,result)=>{
    if(result){
        let token = jwt.sign({email, userid : user._id},"secret")
        res.cookie("token",token)
     res.status(200).send("You can login")
    }
    else{
        res.redirect("/login")
    }
   })

})

app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.redirect("/login")
})

function isLoggedIn (req,res,next){
    if(req.cookies.token === "") res.send("You need to login first")
    else{
   let data = jwt.verify(req.cookies.token, "secret")
   req.user = data    
   next()
}
    }



app.listen(3000)

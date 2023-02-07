const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');

const { User } = require("./models/User");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());
const mongoose = require('mongoose')
mongoose.set('strictQuery', true);
mongoose.connect(config.mongoURI)
  .then(() => console.log('Mongodb connect...'))
  .catch(err => console.log(err))

app.get('/', (req, res) => {res.send('Hello World!')})
//아직 client 부분을 하지않아서 postman을 통해서 가져온다/
app.post('/register', (req, res) => {
  //회원 가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터베이스에 넣어준다.

    const user = new User(req.body) 

    //mongodb 에서 받아온 정보 저장
    user.save((err,userInfo)=> {
      if(err) return res.json({success:false,err})
      return res.status(200).json({
        sucess: true
      })
    })
}) 

app.post('/login', (req, res)=>{
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({email: req.body.email },(err, user)=>{
    if(!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }

  //요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인.
    user.comparePassword(req.body.password , (err,isMatch)=>{
      if(!isMatch)
        return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다."})

      //비밀번호 까지 맞다면 토큰을 생성하기.
      user.generateToken((err, user)=>{
        if(err) return res.status(400).send(err);

            res.cookie("x_auth", user.token)
            .status(200)
            .json({loginSuccess: true, userId: user._id})
      })
    
   })
  })
  
  
})
  
app.listen(port, () => {console.log(`Example app listening on port ${port}`)})
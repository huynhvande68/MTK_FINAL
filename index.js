require('dotenv').config();
const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");

//!Thêm
const AccountRouter = require('./routers/AccountRouter');
const flash = require('express-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const {check,validationResult} = require('express-validator')
const bcrypt = require('bcrypt');
app.use(express.urlencoded());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser('mvm'));
app.use(session({cookie: { maxAge : 6000}}));
app.use(flash());
//!

app.get('/', (req, res) => {
  if(!req.session.user) {
      return res.redirect('/account/login');
  }
  const user = req.session.user;

  res.render('index', {user});

});

app.use('/account', AccountRouter);

const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
const { ExpressPeerServer } = require("peer");
const opinions = {
  debug: true,
}

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));

app.get("/call", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});
app.get("/", (req, res) => {
  res.render('home');
});
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});



// const io = socketio(httpServer);

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    setTimeout(()=>{
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000)
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});


const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log('http://localhost:'+PORT);
})
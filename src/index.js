const express = require("express");
const path = require("path");
const app = express();

const hbs = require("hbs");
require("./db/conn");
const Register = require("./models/registers");

//path.join gives folder path
const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partial_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));
app.set("view engine", "ejs");
app.set("views", template_path);
hbs.registerPartials(partial_path);

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/register", (req, res) => {
  res.render("register");
});

//create new user in database
app.post("/register", async (req, res) => {
  try {
    // console.log(req.body.email);
    // res.send(req.body.email);

    const password = req.body.password;
    const cpassword = req.body.cpassword;

    if (password === cpassword) {
      const userRegister = new Register({
        email: req.body.email,
        username: req.body.username,
        password: password,
      });

      const registered = await userRegister.save();
      res.status(201).render("index");
    } else {
      res.send("password are not matching ! try again!!");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
var value = 0;
var name = "";
app.post("/login", async (req, res) => {
  try {
    // console.log(req.body.email);
    // res.send(req.body.email);

    const email = req.body.email;
    const password = req.body.password;
    const userdetails = await Register.findOne({ email: email });
    name = userdetails.username;
    console.log(name);
    if (userdetails.password === password) {
      value = 1;
    }

    if (userdetails.password === password) {
      //which page to show command
      res.status(200).redirect(`/${uuidv4()}`);
      //res.status(200).send("login done");
    } else {
      res.status(400).send("Invalid Login Details");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/index", (req, res) => {
  res.render("index");
});
app.get("/about", (req, res) => {
  res.render("about");
});

//room logic

// const cors = require('cors')
// app.use(cors())
//back-end javascript file

const server = require("http").Server(app); //building my server port
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid"); //importing uuid libraries installed
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

//tell app to use peerjs for media connections
app.use("/peerjs", peerServer);
//get simple url localhost:4000
app.get("/room", (req, res) => {
  if (value == 1) {
    res.redirect(`/${uuidv4()}`);
  } else {
    res.render("login");
  }
  // res.redirect(`/${uuidv4()}`);
});

//get room id now
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

//connect socket to specific room by visiting my home page
//socket io code that tells user connect broadcast it to all
io.on("connection", (socket) => {
  console.log(name);
  socket.emit("getname", name);
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
    socket.on("message", (mes) => {
      io.to(roomId).emit("createMessage", mes);
    });
    socket.on("screen-share", (data) => {
      console.log(data);
      io.to(roomId).emit("addScreen", data);
    });
  });
});

server.listen(process.env.PORT || 3000);

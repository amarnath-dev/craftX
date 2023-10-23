const express = require('express');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const mongoose = require('mongoose');
require('dotenv').config();
const hbs = require('express-handlebars')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const nocache = require('nocache')
const path = require('path');
const punycode = require('punycode');


const app = express();
app.use(nocache())


//Using Modules
app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));



app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
  })
);


// Making the connection to MongoDB
const mongoDBURI = process.env.MONGODB_URI;
mongoose.connect(mongoDBURI, {
  useNewUrlParser: true,         
  useUnifiedTopology: true, 
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB!');
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.engine('hbs', hbs.engine({ 
  layoutsDir: __dirname + '/views/layouts',
  extname: 'hbs',
  defaultLayout: 'layout',
  partialsDir:__dirname+'/views/partials',
  runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
      }
    }));




//using things
app.use('/',userRouter);
app.use('/admin',adminRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//Listening to port
app.listen(3000, (req,res)=>{
  console.log("App is listening to port 5000")
});



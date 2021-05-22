const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const cookieParser = require("cookie-parser");


const userUssdRoutes = require('./routes/user');
const territoireRoutes = require('./routes/territoire');
const localiteRoutes = require('./routes/localite');
const provinceRoutes = require('./routes/province');
const zoneSanteRoutes = require('./routes/zoneSante');
const maladieRoutes = require('./routes/maladie');
const naissanceRoutes = require('./routes/naissance');
const villeRoutes = require('./routes/ville');
const casRoutes = require('./routes/cas');
var indexRouter = require('./routes/index');


// DB Config
const db = require('./config/key').mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', '*');
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// this is where we'll handle our various routes from
const fileRoutes = require('./routes/files')(app, fs);

app.use('/', userUssdRoutes);
app.use('/api/v1', indexRouter);
app.use('/api/v1/localite', localiteRoutes);
app.use('/api/v1/territoire', territoireRoutes);
app.use('/api/v1/province', provinceRoutes);
app.use('/api/v1/ville', villeRoutes);
app.use('/api/v1/zone', zoneSanteRoutes);
app.use('/api/v1/maladie', maladieRoutes);
app.use('/api/v1/naissance', naissanceRoutes);
app.use('/api/v1/cas', casRoutes);

app.listen(PORT, () => console.log(`running on localhost:${PORT}`));


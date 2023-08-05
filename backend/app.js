const express = require('express');
const app = express();
const cookierParser = require('cookie-parser');
const cors = require("cors");
app.use(cors());

const dotenv = require('dotenv');
dotenv.config({ path : 'backend/config/config.env'});

//using middelwares
app.use(express.json({ limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb' ,extended : true}));
app.use(cookierParser());

//importing routes
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');

//using routes
app.use('/api/v1', postRouter);
app.use('/api/v1', userRouter);

module.exports = app;
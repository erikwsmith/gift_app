require('dotenv').config();

const PORT = process.env.PORT || 8000;
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const appRoutes = require('./routes/appRoutes');

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true});
const connection = mongoose.connection;
connection.once('open', ()=>{
    console.log('MongoDB connection established successfuly!');
})

//express
const app = express();

//middleware
app.use(express.json());
app.use(cors());

//routes
app.use('/', appRoutes);

//run app
app.listen(PORT, ()=>{
    console.log(`App is listening on PORT ${PORT}`);
})
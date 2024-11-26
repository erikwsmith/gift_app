const mongoose = require('mongoose');
const User = require('../models/userModel');

//retrieve all users
const getUsers = async( req, res ) => {
    const users = await User.find({}).sort({});
    res.status(200).json(users);
}
//retrieve single user
const getUser = async( req, res) => {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
}
//update user record
const updateUser = async( req, res ) => {
    const{id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({Error: 'Book does not exist'});        
    };
    const user = await User.findOneAndUpdate({_id: id}, {
        ...req.body
    });
    if(!user){
        return res.status(400).json({Error: 'User does not exist.'});
    };
    res.status(200).json(user);
}

module.exports = {
    getUsers,
    getUser,
    updateUser
}
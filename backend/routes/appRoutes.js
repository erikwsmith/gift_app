const express = require('express');
const router = express.Router();

const {getUsers, getUser, updateUser} = require('../controllers/usersController');

//USERS
router.get('/users', getUsers); //READ all users
router.get('/users/:id', getUser); //READ a single user
router.patch('/users/:id', updateUser); //UPDATE a single user

module.exports = router;
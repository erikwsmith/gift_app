const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema ({
    first_name: {type: String, required: true, minlength: 1, trim: true},
    last_name: {type: String, required: true, minlength: 1, trim: true},
    username: {type: String, required: true, minlength: 1, trim: true},
    password: {type: String, required: true, minlength: 1, trim: true},
    gifts: [{ 
        name:  {type: String, required: true, minlength: 1},
        quantity: {type: Number},
        description: {type: String},
        url: {type: String},
        claimed: {type: Boolean},
        claimedBy: {type: String} 
    }]
}, {
    timestamps: true
}, {
    collection: 'users'
});

const User = mongoose.model('User', userSchema);

module.exports = User;
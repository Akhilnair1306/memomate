const express = require ('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router  = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'qwerty'

// Route 1: Create a User using: POST "/api/auth/createUser". no login required
router.post('/createuser',[
    body('name','Enter a valid name').isLength({min: 3}),
    body('email').isEmail(),
    body('password').isLength({min: 5})
],async (req,res)=> {
    let success = false;
    //If there are errors, return Bad req and the errors
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({success, errors: errors.array() });
    }
    try{
    let user = await User.findOne({email: req.body.email});
    if (user){
        return res.status(400).json({success, error:"Sorry a user with this email already exists"})
    }
    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(req.body.password,salt)
    user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email
    });

    const data = {
        user:{
            id:user.id
        }
    }

    const authtoken = jwt.sign(data,JWT_SECRET);
    success = true;
    res.json({success, authtoken})

    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error occured");
    }
})

// Route 2: Authenticate a user
router.post('/login', [
    body('email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        };

        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error occured");
    }
});

//Route 3: Get Loggedin User Req: Login Req
router.post('/getuser',fetchuser, async(req,res)=>{
try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
} catch (error) {
    console.error(error.message);
    res.status(500).send("Some Error occured");
}
})


module.exports = router
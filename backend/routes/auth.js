const express = require('express');
const User = require("../models/User")
const { body, validationResult } = require('express-validator');
const router = express.Router();

const bcrypt = require('bcryptjs');

const fetchUser = require("../middleware/fetchUser")
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Abhishek';


// ROUTE 1 :  Create a User using POST "/api/auth/createuser". No login required
router.post('/createuser', [
    // The 3 lines is for Email Validation using Express Validator
    body('name', 'Enter a valid name: ').isLength({min: 3}), /* NAME VALIDATOR */
    body('password', 'Enter a valid password: ').isLength({min: 5}), /* PASSWORD VALIDATOR */
    body('email', 'Enter a valid email: ').isEmail()], /* EMAIL VALIDATOR */
    
    async (req, res) => {
        let success = false;

        // If errors exist, return Bad request
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ success, errors: errors.array() });
        }

        try{
            // Check whether the user with this email exist already
            let user = await User.findOne({email: req.body.email});
            if(user){
                return res.status(400).json({success, error: "A user exists with the same email"})
            }

            // Salt for password
            const salt = await bcrypt.genSaltSync(10);
            const secPass = await bcrypt.hash(req.body.password, salt);

            // Create user
            user = await User.create({
                name: req.body.name,
                password: secPass,
                email: req.body.email,
            });

            const data ={
                user: {
                    id: user.id
                }
            }

            const authToken = jwt.sign(data, JWT_SECRET);
            
            success = true;
            res.json({success, authToken})

        } catch(err){
            console.error(error.message);
            res.status(500).send("Internal Server Error occured");
        }
})


// ROUTE 2 : Authenticate a user using POST "/api/auth/login". No login required
router.post('/login', [
    
    body('email', 'Enter a valid email: ').isEmail(), /* EMAIL VALIDATOR */
    body('password', 'Enter a valid password(cannot be blank): ').exists()],
    async (req, res) => {
        let success = false;
        // If errors exist, return Bad request
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }
        
        const {email, password} = req.body;
        try{
            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({success, error: 'Please enter correct credentials'});
            }

            const passwordCompare = await bcrypt.compare(password, user.password);
            if(!passwordCompare){
                return res.status(400).json({success, error: 'Please enter correct credentials'});
            }

            const data ={
                user: {
                    id: user.id
                }
            }

            const authToken = jwt.sign(data, JWT_SECRET);
            success=true;
            res.json({ success, authToken});

        }catch(error){
            console.error(error.message);
            res.status(500).send("Internal Server Error occured");
        }
    })


    // ROUTE 3 : Get Logged in user details using POST "/api/auth/getuser". Login required
    router.post('/getuser', fetchUser, async (req, res) => {
        try{
            userId = req.user.id;
            const user = await User.findById(userId).select("-password");
            res.send(user)
        }catch(error){
            console.error(error.message);
            res.status(500).send("Internal Server Error occured");
        }
    })

module.exports = router
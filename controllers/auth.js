const jwt = require("jsonwebtoken");
const Users = require('../models/Auth.js');
const bcrypt = require('bcrypt');
const mailSender = require("../utils/mailSender.js");

exports.signUp = async (req, res) => {
    try {
        const { signUpemail, signUppassword, cnfPassword } = req.body;

        if (!signUpemail || !signUppassword) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            })
        }
        // check if user already exists in the database
        const existingUser = await Users.findOne({ email: signUpemail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            });
        }

        if(signUppassword != cnfPassword){
            return res.status(422).json({
                success: false,
                message: "Password and confirm password do not match"
            })
        }

        const hashedPassword = await bcrypt.hash(signUppassword, 10);

        const user = await Users.create({
            email:signUpemail,
            password: hashedPassword,
        });


        return res.status(200).json({
            success: true,
            user,
            message: "User registered successfully",
        });


    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
        });
    }
}

exports.loginWithGoogle = async (req, res) => {
    const { email } = req.body;

    try {
        const existingUser = await Users.findOne({ email })
            .populate('subscribers')
            .populate('subscriptions'); 
        if (!existingUser) {
            try {
                const newUser = await Users.create({ email });

                const token = jwt.sign({
                    email: newUser.email,
                    id: newUser._id
                }, process.env.JWT_SECRET, {
                    expiresIn: "1h"
                });
                res.status(200).json({ result: newUser, token });
            } catch (error) {
                res.status(500).json({ message: "Something went wrong..." });
            }
        } else {
            const token = jwt.sign({
                email: existingUser.email,
                id: existingUser._id
            }, process.env.JWT_SECRET, {
                expiresIn: "1h"
            });
            res.status(200).json({ result: existingUser, token });
        }
    } catch (error) {
        res.status(500).json({ message: "Something went wrong..." });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email);
        console.log(password);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields required',
            });
        }

        const user = await Users.findOne({ email: email })
        .populate('subscribers')
        .populate('subscriptions'); ;


        if (!user) {

            return res.status(404).json({
                success: false,
                message: 'User not Registered with Us, Please Signup to continue',
            });
            
        }

        if(user.blocked === true){
            console.log("Your Account has been blocked");
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked,please try after one hour'
            })
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({
                email: user.email,
                id: user._id
            }, process.env.JWT_SECRET, {
                expiresIn: "1h"
            });
            res.status(200).json({
                result: user,
                token,
            });
        } else {

            if(!user.blocked){
                user.failedAttempts += 1;
                await user.save();
            }

            try {
                if (user.failedAttempts === 3) {
                    const emailResponse = await mailSender(
                        user.email,
                        "Regarding Your failed Attempts",
                        `<h1>Your account attempted 3 times failed attempts</h1>
                        <h3><b>Attempting 5 times failed attempt may lead to account block for 1 hour</b></h3>`
                    );
                    console.log("Email sent successfully:", emailResponse.response);
                }

                if(user.failedAttempts === 5) {

                    user.blocked = true;
                    await user.save();

                    const emailResponse = await mailSender(
                        user.email,
                        "Regarding Your failed Attempts",
                        `<h1>Your account attempted 5 times failed attempts</h1>
                        <h3><b>We have blocked your account for 1 hour, for security reasons. You will able to login after 1 hour </b></h3>`
                    );
                    console.log("Email sent successfully:", emailResponse.response);

                    setTimeout(async () => {
                        user.blocked = false;
                        user.failedAttempts = 0;
                        await user.save();

                    }, 3600000 );
                }

            } catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Error occurred while sending email",
                    error: error.message,
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Incorrect password',
                failedAttempts: user.failedAttempts
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.getUserDetails = async (req, res) => {
    try {

        const token = req.headers.authorization.split(' ')[1];

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decodedData);
        const userId = decodedData.id;

        const userDetails = await Users.findOne({ _id: userId })
            .populate('subscribers')
            .populate('subscriptions');
        
        

        if (!userDetails) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            result: userDetails,
            token
        })

    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Something went wrong..." });
    }
}



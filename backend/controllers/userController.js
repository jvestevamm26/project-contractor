const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, location } = req.body;

        const trimmedName = typeof name === "string" ? name.trim() : "";
        const trimmedEmail = typeof email === "string" ? email.trim() : "";

        if (!trimmedName || !trimmedEmail || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password, and role are required"
            });
        }

        if (role !== "client" && role !== "contractor") {
            return res.status(400).json({
                message: "role must be either 'client' or 'contractor'"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.createUser(
            trimmedName,
            trimmedEmail,
            hashedPassword,
            role,
            location
        );

        res.status(201).json(user);

    } catch (error) {
        console.log(error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "An account with that email already exists"
            });
        }

        res.status(500).json({
            message: "Error creating user"
        });
    }
};



const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const trimmedEmail = typeof email === "string" ? email.trim() : "";

        const user = await User.findUserByEmail(trimmedEmail);

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }


        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatch) {
            return res.status(400).json({
                message: "Wrong password"
            });
        }


        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


        res.json({
            message: "Login successful",
            token: token
        });


    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Login error"
        });
    }
};



module.exports = {
    registerUser,
    loginUser
};
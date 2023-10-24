const bcrypt = require('bcrypt');
const { User } = require('./User.js');


function createAuthApi(app) {
    // Routes for login and signup
    app.post('/login', async (req, res) => {
        // Handle login logic
        const { username, password } = req.body;

        try {
            // Perform login authentication (replace this with your own authentication logic)
            const user = await User.findOne({ username });
            if (!user) {
                // User not found
                const response = {
                    success: false,
                    message: 'User not registered'
                };
                res.status(404).json(response);
                return;
            }

            // Compare the provided password with the hashed password in the database
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                // Invalid password
                const response = {
                    success: true,
                    message: 'Invalid password'
                };
                res.status(401).json(response);
                return;
            }

            // Authentication successful

            const response = {
                success: true,
                message: 'Authentication successful',
            };
            res.status(200).json(response);
            return;
        } catch (error) {
            console.error(error);
            return res.status(500).send('Internal server error');
        }
    });


    app.post('/signup', async (req, res) => {
        // Handle signup logic
        const { username, password, name, profilePic, about, status } = req.body;

        if (!password) {
            const response = {
                success: false,
                message: 'Password is required'
            };
            res.status(400).json(response);
            return;
        }

        try {
            // Hash the password using bcrypt
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create a new user document in the database
            const user = new User({
                username,
                password: hashedPassword,
                name,          // Add the name field
                profilePic,    // Add the profilePic field
                about,         // Add the about field
                status         // Add the status field
            });

            // Save the user document
            await user.save();

            const response = {
                success: true,
                message: 'User created successfully',
            };
            res.status(201).json(response);
            return;
        } catch (error) {
            if (error.code === 11000 && error.keyPattern && error.keyPattern.username === 1) {
                // Duplicate key error (username already exists)
                const response = {
                    success: false,
                    message: 'Username is already taken',
                };
                res.status(409).json(response);
            } else {
                console.error(error);
                const response = {
                    success: false,
                    message: 'Error creating user'
                };
                res.status(500).json(response);
            }
            return;
        }
    });
    app.put('/update-profile', async (req, res) => {
        const { username, profilePic, about, status } = req.body;

        try {
            // Find the user by their username
            const user = await User.findOne({ username });

            if (!user) {
                const response = {
                    success: false,
                    message: 'User not found'
                };
                res.status(404).json(response);
                return;
            }

            // Update the optional fields if provided
            if (profilePic) user.profilePic = profilePic;
            if (about) user.about = about;
            if (status) user.status = status;

            // Save the updated user document
            await user.save();

            const response = {
                success: true,
                message: 'Profile updated successfully',
            };
            res.status(200).json(response);
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    app.get('/search-users', async (req, res) => {
        const { query } = req.query;

        try {
            // Search for users with matching username or name
            const matchingUsers = await User.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } }, // Case-insensitive username search
                    { name: { $regex: query, $options: 'i' } }       // Case-insensitive name search
                ]
            });

            // Exclude sensitive information before sending the response
            const sanitizedUsers = matchingUsers.map(user => {
                return {
                    username: user.username,
                    name: user.name,
                    profilePic: user.profilePic,
                    about: user.about,
                    status: user.status
                };
            });

            res.status(200).json({ results: sanitizedUsers });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });

    app.post('/chat-request', async (req, res) => {
        const { senderUsername, recipientUsername } = req.body;

        try {
            // Emit a chatRequest event to the recipient
            const recipientSocket = getUserSocketByUsername(recipientUsername); // Implement this function
            if (recipientSocket) {
                recipientSocket.emit("chatRequest", { senderUsername });
            }
            res.status(200).json({ success: true, message: 'Chat request sent' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    });


}
module.exports = { createAuthApi };
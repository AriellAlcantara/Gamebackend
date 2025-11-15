const express = require('express');
const dotenv = require('dotenv');
const playerModel = require('./models/playerModel');

dotenv.config();

const app = express();
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
    res.json({message: "Welcome to Game Backend Server!"});    
});

// PLAYER AUTHENTICATION & DATA ROUTES

// POST /api/player/register - Register a new player
app.post('/api/player/register', (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Check if player already exists
        const existingPlayer = playerModel.findPlayerByUsername(username);
        if (existingPlayer) {
            return res.status(409).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        // Create new player
        const newPlayer = playerModel.createPlayer({
            username,
            password,
            email
        });

        res.status(201).json({ 
            success: true, 
            message: 'Player registered successfully',
            data: {
                id: newPlayer.id,
                username: newPlayer.username,
                email: newPlayer.email,
                level: newPlayer.level,
                experience: newPlayer.experience
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Registration failed', 
            error: error.message 
        });
    }
});

// POST /api/player/login - Login player
app.post('/api/player/login', (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // Find player
        const player = playerModel.findPlayerByUsername(username);
        if (!player) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }

        // Check password (simple comparison - in production, use bcrypt)
        if (player.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            data: {
                id: player.id,
                username: player.username,
                email: player.email,
                level: player.level,
                experience: player.experience
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Login failed', 
            error: error.message 
        });
    }
});

// GET /api/player - Get player data
app.get('/api/player', (req, res) => {
    try {
        const playerId = req.query.id;

        if (!playerId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Player ID is required' 
            });
        }

        const player = playerModel.findPlayerById(playerId);
        if (!player) {
            return res.status(404).json({ 
                success: false, 
                message: 'Player not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Player data retrieved',
            data: {
                id: player.id,
                username: player.username,
                email: player.email,
                level: player.level,
                experience: player.experience
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to retrieve player data', 
            error: error.message 
        });
    }
});

// PUT /api/player - Update player data
app.put('/api/player', (req, res) => {
    try {
        const { id, level, experience, email } = req.body;

        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Player ID is required' 
            });
        }

        const updatedPlayer = playerModel.updatePlayer(id, {
            level,
            experience,
            email
        });

        if (!updatedPlayer) {
            return res.status(404).json({ 
                success: false, 
                message: 'Player not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Player data updated',
            data: {
                id: updatedPlayer.id,
                username: updatedPlayer.username,
                email: updatedPlayer.email,
                level: updatedPlayer.level,
                experience: updatedPlayer.experience
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update player data', 
            error: error.message 
        });
    }
});

// DELETE /api/delete/:playerId - Delete player
app.delete('/api/delete/:playerId', (req, res) => {
    try {
        const { playerId } = req.params;

        const player = playerModel.findPlayerById(playerId);
        if (!player) {
            return res.status(404).json({ 
                success: false, 
                message: 'Player not found' 
            });
        }

        playerModel.deletePlayer(playerId);

        res.status(200).json({ 
            success: true, 
            message: 'Player deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete player', 
            error: error.message 
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
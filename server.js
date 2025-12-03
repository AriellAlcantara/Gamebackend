const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Player = require('./models/playerModel');

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('MONGODB_URI is not defined in environment variables.');
} else {
    mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000
    }).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(`MongoDB connection error: ${err}`));
}

const app = express();
app.use(express.json());
// Admin secret: fallback to hardcoded 'Kate_Admin' if env not set
const ADMIN_SECRET = process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || 'Kate_Admin';

// Welcome route
app.get('/', (req, res) => {
    res.json({message: "Welcome to Game Backend Server!"});    
});

// PLAYER AUTHENTICATION & DATA ROUTES

// POST /api/player/register - Register a new player
app.post('/api/player/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        const existing = await Player.findOne({ username });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const player = await Player.create({ username, password: hashed, email });

        return res.status(201).json({
            success: true,
            message: 'Player registered successfully',
            data: {
                id: player._id,
                username: player.username,
                email: player.email,
                level: player.level,
                experience: player.experience,
                score: player.score,
                wins: player.wins,
                losses: player.losses
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
    }
});

// POST /api/player/login - Login player
app.post('/api/player/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required' });
        }

        const player = await Player.findOne({ username });
        if (!player) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const match = await bcrypt.compare(password, player.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        player.lastLoginAt = new Date();
        await player.save();

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                id: player._id,
                username: player.username,
                email: player.email,
                level: player.level,
                experience: player.experience,
                score: player.score,
                wins: player.wins,
                losses: player.losses,
                lastLoginAt: player.lastLoginAt
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Login failed', error: err.message });
    }
});

// GET /api/player - Authenticated player data fetch (requires password)
// Accepts: /api/player?id=<id>&password=... OR /api/player?username=<username>&password=...
// Also supports JSON body fallback { id|username, password }
app.get('/api/player', async (req, res) => {
    try {
        let { id, username, password } = req.query;
        if ((!id && !username) && req.body) {
            id = req.body.id;
            username = req.body.username;
            password = req.body.password;
        }
        if (!id && !username) {
            return res.status(400).json({ success: false, message: 'Provide id or username (query/body)' });
        }
        if (!password) {
            return res.status(401).json({ success: false, message: 'Password required' });
        }
        const player = id ? await Player.findById(id) : await Player.findOne({ username });
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found' });
        }
        const match = await bcrypt.compare(password, player.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        return res.status(200).json({
            success: true,
            message: 'Player data retrieved',
            data: {
                id: player._id,
                username: player.username,
                email: player.email,
                level: player.level,
                experience: player.experience,
                score: player.score,
                wins: player.wins,
                losses: player.losses,
                lastLoginAt: player.lastLoginAt
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve player data', error: err.message });
    }
});

// Authenticated POST fetch endpoint
app.post('/api/player/get', async (req, res) => {
    try {
        const { id, username, password } = req.body || {};
        if (!id && !username) {
            return res.status(400).json({ success: false, message: 'Provide id or username in body' });
        }
        if (!password) {
            return res.status(401).json({ success: false, message: 'Password required' });
        }
        const player = id ? await Player.findById(id) : await Player.findOne({ username });
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found' });
        }
        const match = await bcrypt.compare(password, player.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        return res.status(200).json({
            success: true,
            message: 'Player data retrieved',
            data: {
                id: player._id,
                username: player.username,
                email: player.email,
                level: player.level,
                experience: player.experience,
                score: player.score,
                wins: player.wins,
                losses: player.losses,
                lastLoginAt: player.lastLoginAt
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to retrieve player data', error: err.message });
    }
});

// PUT /api/player - Authenticated update (requires currentPassword)
// Body: { id|username, currentPassword, [level|experience|email|score|wins|losses|password(new)] }
app.put('/api/player', async (req, res) => {
    try {
        const { id, username, currentPassword, level, experience, email, score, wins, losses, password } = req.body;
        if (!id && !username) {
            return res.status(400).json({ success: false, message: 'Provide id or username in request body' });
        }
        if (!currentPassword) {
            return res.status(401).json({ success: false, message: 'currentPassword required' });
        }
        const player = id ? await Player.findById(id) : await Player.findOne({ username });
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found' });
        }
        const authMatch = await bcrypt.compare(currentPassword, player.password);
        if (!authMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        if (level !== undefined) player.level = level;
        if (experience !== undefined) player.experience = experience;
        if (email !== undefined) player.email = email;
        if (score !== undefined) player.score = score;
        if (wins !== undefined) player.wins = wins;
        if (losses !== undefined) player.losses = losses;
        if (password) {
            player.password = await bcrypt.hash(password, 10);
        }
        await player.save();
        return res.status(200).json({
            success: true,
            message: 'Player data updated',
            data: {
                id: player._id,
                username: player.username,
                email: player.email,
                level: player.level,
                experience: player.experience,
                score: player.score,
                wins: player.wins,
                losses: player.losses
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to update player data', error: err.message });
    }
});

// DELETE /api/delete/:playerId - Authenticated delete by id (body: { password })
app.delete('/api/delete/:playerId', async (req, res) => {
    try {
        const { playerId } = req.params;
        const { password } = req.body || {};
        if (!password) {
            return res.status(401).json({ success: false, message: 'Password required' });
        }
        const player = await Player.findById(playerId);
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found' });
        }
        const match = await bcrypt.compare(password, player.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        await player.deleteOne();
        return res.status(200).json({ success: true, message: 'Player deleted successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to delete player', error: err.message });
    }
});

// DELETE /api/delete (body: { id|username, password }) - authenticated flexible delete
app.delete('/api/delete', async (req, res) => {
    try {
        const { id, username, password } = req.body;
        if (!id && !username) {
            return res.status(400).json({ success: false, message: 'Provide id or username in body' });
        }
        if (!password) {
            return res.status(401).json({ success: false, message: 'Password required' });
        }
        const player = id ? await Player.findById(id) : await Player.findOne({ username });
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found' });
        }
        const match = await bcrypt.compare(password, player.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        await player.deleteOne();
        return res.status(200).json({ success: true, message: 'Player deleted successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to delete player', error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Legacy plural path support for clients still calling /api/players/register
app.post('/api/players/register', async (req, res) => {
    // Forward to singular handler logic
    return app._router.handle({ ...req, url: '/api/player/register' }, res, () => {});
});

// Legacy plural path support for clients still calling /api/players/login
app.post('/api/players/login', async (req, res) => {
    return app._router.handle({ ...req, url: '/api/player/login' }, res, () => {});
});

// ADMIN: Get Users (auth via ADMIN_PASSWORD or ADMIN_TOKEN)
app.get('/api/players', async (req, res) => {
    try {
        const adminSecret = ADMIN_SECRET;
        const provided = req.query.adminPassword
            || req.headers['x-admin-password']
            || req.headers['x-admin-token']
            || (req.headers['authorization'] ? req.headers['authorization'].replace(/^Bearer\s+/i, '') : undefined);

        if (!provided) {
            return res.status(401).json({ success: false, message: 'Admin credential required' });
        }
        if (provided !== adminSecret) {
            return res.status(403).json({ success: false, message: 'Invalid admin credential' });
        }

        const players = await Player.find({}, 'username level experience score wins losses');
        const data = players.map(p => ({
            id: p._id,
            username: p.username,
            level: p.level,
            experience: p.experience,
            score: p.score,
            wins: p.wins,
            losses: p.losses
        }));
        return res.status(200).json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to get users', error: err.message });
    }
});

// ADMIN: Get Users via POST with body { adminPassword }
app.post('/api/players/get', async (req, res) => {
    try {
        const adminSecret = ADMIN_SECRET;
        const provided = (req.body && (req.body.adminPassword || req.body.adminToken))
            || req.headers['x-admin-password']
            || req.headers['x-admin-token']
            || (req.headers['authorization'] ? req.headers['authorization'].replace(/^Bearer\s+/i, '') : undefined);

        if (!provided) {
            return res.status(401).json({ success: false, message: 'Admin credential required' });
        }
        if (provided !== adminSecret) {
            return res.status(403).json({ success: false, message: 'Invalid admin credential' });
        }

        const players = await Player.find({}, 'username level experience score wins losses');
        const data = players.map(p => ({
            id: p._id,
            username: p.username,
            level: p.level,
            experience: p.experience,
            score: p.score,
            wins: p.wins,
            losses: p.losses
        }));
        return res.status(200).json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to get users', error: err.message });
    }
});

// PUBLIC: Leaderboard (top N by score)
app.get('/api/leaderboard', async (req, res) => {
    try {
        const limitRaw = parseInt(req.query.limit, 10);
        const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 50) : 10;
        const players = await Player.find({}, 'username score').sort({ score: -1 }).limit(limit);
        const data = players.map(p => ({ username: p.username, score: p.score }));
        return res.status(200).json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to get leaderboard', error: err.message });
    }
});

// DELETE /api/player - Authenticated delete by username or id (body: { id|username, password })
app.delete('/api/player', async (req, res) => {
    try {
        const { id, username, password } = req.body || {};
        if (!id && !username) {
            return res.status(400).json({ success: false, message: 'Provide id or username in body' });
        }
        if (!password) {
            return res.status(401).json({ success: false, message: 'Password required' });
        }
        const player = id ? await Player.findById(id) : await Player.findOne({ username });
        if (!player) {
            return res.status(404).json({ success: false, message: 'Player not found' });
        }
        const match = await bcrypt.compare(password, player.password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        await player.deleteOne();
        return res.status(200).json({ success: true, message: 'Player deleted successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to delete player', error: err.message });
    }
});
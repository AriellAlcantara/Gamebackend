const fs = require('fs');
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '../data');
const playersFile = path.join(dbPath, 'players.json');

// Ensure data directory exists
if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
}

// Initialize players.json if it doesn't exist
if (!fs.existsSync(playersFile)) {
    fs.writeFileSync(playersFile, JSON.stringify([], null, 2));
}

// Read all players from JSON database
function getAllPlayers() {
    const data = fs.readFileSync(playersFile, 'utf-8');
    return JSON.parse(data);
}

// Write players to JSON database
function saveAllPlayers(players) {
    fs.writeFileSync(playersFile, JSON.stringify(players, null, 2));
}

// Find player by ID
function findPlayerById(playerId) {
    const players = getAllPlayers();
    return players.find(p => p.id === playerId);
}

// Find player by username
function findPlayerByUsername(username) {
    const players = getAllPlayers();
    return players.find(p => p.username === username);
}

// Create new player
function createPlayer(playerData) {
    const players = getAllPlayers();
    const newPlayer = {
        id: Date.now().toString(),
        username: playerData.username,
        password: playerData.password,
        email: playerData.email || '',
        level: playerData.level || 1,
        experience: playerData.experience || 0,
        createdAt: new Date().toISOString()
    };
    players.push(newPlayer);
    saveAllPlayers(players);
    return newPlayer;
}

// Update player
function updatePlayer(playerId, updateData) {
    const players = getAllPlayers();
    const playerIndex = players.findIndex(p => p.id === playerId);
    
    if (playerIndex === -1) {
        return null;
    }
    
    // Don't allow updating password via this method
    const { password, ...safeUpdateData } = updateData;
    players[playerIndex] = { ...players[playerIndex], ...safeUpdateData };
    saveAllPlayers(players);
    return players[playerIndex];
}

// Delete player
function deletePlayer(playerId) {
    const players = getAllPlayers();
    const filteredPlayers = players.filter(p => p.id !== playerId);
    saveAllPlayers(filteredPlayers);
    return true;
}

module.exports = {
    getAllPlayers,
    saveAllPlayers,
    findPlayerById,
    findPlayerByUsername,
    createPlayer,
    updatePlayer,
    deletePlayer
};

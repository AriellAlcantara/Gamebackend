# Unity Game Backend Integration Guide

## Backend Setup ✓ COMPLETE

Your Node.js backend is now running on `http://localhost:5000` with the following API endpoints:

### API Routes

#### Authentication Routes

**POST `/api/player/register`**
- Registers a new player
- Request body:
  ```json
  {
    "username": "player_name",
    "password": "password123",
    "email": "player@example.com"
  }
  ```
- Returns: Player ID, username, email, level, experience

**POST `/api/player/login`**
- Logs in an existing player
- Request body:
  ```json
  {
    "username": "player_name",
    "password": "password123"
  }
  ```
- Returns: Player data on success

#### Player Data Routes

**GET `/api/player`**
- Get player data by ID
- Query parameter: `id` (player ID)
- Returns: Player data

**PUT `/api/player`**
- Update player data
- Request body:
  ```json
  {
    "id": "player_id",
    "level": 5,
    "experience": 1000,
    "email": "newemail@example.com"
  }
  ```
- Returns: Updated player data

**DELETE `/api/delete/:playerId`**
- Delete a player account
- URL parameter: `playerId`
- Returns: Success message

---

## Unity Setup Instructions

### Step 1: Create Scripts
Copy the following files to your Unity project's `Assets/Scripts/` folder:
- `GameBackendManager.cs` - Handles all API calls
- `PlayerManager.cs` - Manages player data and PlayerPrefs

### Step 2: Scene Setup
1. In your main scene, create two empty GameObjects
2. Attach `GameBackendManager.cs` to the first one
3. Attach `PlayerManager.cs` to the second one
4. Both scripts use Singleton pattern (auto-instantiated)

### Step 3: Basic Usage

#### Register a Player
```csharp
string username = "PlayerName";
string password = "SecurePassword123";
string email = "player@example.com";

PlayerManager.instance.Register(username, password, email);
```

#### Login a Player
```csharp
PlayerManager.instance.Login("PlayerName", "SecurePassword123");
```

#### Get Current Player
```csharp
LocalPlayerData currentPlayer = PlayerManager.instance.GetCurrentPlayer();
if (currentPlayer != null)
{
    Debug.Log($"Player: {currentPlayer.username}, Level: {currentPlayer.level}");
}
```

#### Update Player Data
```csharp
// Add experience
PlayerManager.instance.AddExperience(100);

// Set level
PlayerManager.instance.SetLevel(5);

// Update all at once
PlayerManager.instance.UpdatePlayerData(level: 5, experience: 1000, email: "new@email.com");
```

#### Refresh Player Data from Backend
```csharp
PlayerManager.instance.RefreshPlayerData();
```

#### Logout Player
```csharp
PlayerManager.instance.Logout();
```

#### Delete Player Account
```csharp
PlayerManager.instance.DeletePlayerAccount();
```

#### Check if Player is Logged In
```csharp
if (PlayerManager.instance.IsPlayerLoggedIn())
{
    Debug.Log("Player is logged in");
}
else
{
    Debug.Log("Please login first");
}
```

---

## Data Storage

### Backend (Node.js)
- Player data is stored in JSON format at: `./data/players.json`
- Automatically created on first player registration
- Persistent across server restarts

### Unity (Client)
- Player session data is stored in **PlayerPrefs**
- Keys used:
  - `player_id` - Player's unique ID
  - `player_username` - Player's username
  - `player_email` - Player's email
  - `player_level` - Player's level
  - `player_experience` - Player's experience points
  - `player_logged_in` - Login status flag (1 = logged in, 0 = logged out)

---

## Example: Complete Login Flow

```csharp
// 1. Register
PlayerManager.instance.Register("MyPlayer", "Pass123", "myplayer@game.com");

// 2. After successful registration, login
PlayerManager.instance.Login("MyPlayer", "Pass123");

// 3. Get player info
LocalPlayerData player = PlayerManager.instance.GetCurrentPlayer();
Debug.Log($"Welcome {player.username}! Level: {player.level}");

// 4. During gameplay, update progress
PlayerManager.instance.AddExperience(250);
PlayerManager.instance.SetLevel(2);

// 5. Check saved data
player = PlayerManager.instance.GetCurrentPlayer();
Debug.Log($"Level: {player.level}, XP: {player.experience}");

// 6. Logout
PlayerManager.instance.Logout();
```

---

## Important Notes

### For Local Testing
- Server runs on `http://localhost:5000`
- Make sure your server is running before playing

### For Production
- Update the server URL in `GameBackendManager`:
  ```csharp
  GameBackendManager.instance.SetServerUrl("https://your-server.com");
  ```

### Security Considerations
- Current implementation stores passwords in plain text (for development only)
- For production, implement proper password hashing (bcrypt)
- Add JWT tokens for secure authentication
- Use HTTPS for all server connections

### Data Persistence
- PlayerPrefs data persists between game sessions
- Auto-loads player data when game starts (if logged in)
- Clearing PlayerPrefs will clear local player data

---

## Troubleshooting

**Server not connecting?**
- Ensure server is running: `node server.js`
- Check that port 5000 is not blocked by firewall
- Verify `http://localhost:5000/` returns welcome message

**PlayerPrefs not saving?**
- Ensure `PlayerManager` is in the scene
- Check Unity console for errors
- PlayerPrefs must be called in Awake/Start, not during construction

**Login fails?**
- Verify username and password are correct
- Check server console for error messages
- Ensure player was registered first

---

## File Structure

```
Gamebackend/
├── server.js                 # Express server
├── package.json             # Dependencies
├── models/
│   └── playerModel.js       # Player data model
├── data/
│   └── players.json         # Player database (auto-created)
└── Unity/
    ├── GameBackendManager.cs # API manager
    └── PlayerManager.cs      # Local player manager
```

---

Happy gaming! 🎮

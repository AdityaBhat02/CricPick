const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors({
    origin: '*', // Allow all origins for dev
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

const path = require('path');
const multer = require('multer');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Teams API ---
app.get('/api/teams', (req, res) => {
    const teams = db.prepare('SELECT * FROM teams').all();
    // Get players for each team
    const teamsWithPlayers = teams.map(team => {
        const players = db.prepare('SELECT id FROM players WHERE soldToTeamId = ?').all(team.id);
        return { ...team, players: players.map(p => p.id) };
    });
    res.json(teamsWithPlayers);
});

app.post('/api/teams', (req, res) => {
    const { name, budget, logo } = req.body;
    const stmt = db.prepare('INSERT INTO teams (name, budget, remainingBudget, logo) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, budget, budget, logo);
    res.json({ id: info.lastInsertRowid, name, budget, remainingBudget: budget, logo, players: [] });
});

app.delete('/api/teams/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM teams WHERE id = ?').run(id);
    // Optional: Reset players sold to this team? For now, let's just keep it simple.
    res.json({ success: true });
});

// --- Players API ---
app.get('/api/players', (req, res) => {
    const players = db.prepare('SELECT * FROM players').all();
    res.json(players);
});

app.post('/api/players', upload.single('imageFile'), (req, res) => {
    const { name, role, style, basePrice, image, status } = req.body;

    // Determine image source: Uploaded file OR URL provided in body
    let imagePath = image;
    if (req.file) {
        // If file uploaded, use the served path
        imagePath = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    }

    const playerStatus = status || 'Unsold';
    const stmt = db.prepare('INSERT INTO players (name, role, style, basePrice, image, status) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(name, role, style || '', basePrice, imagePath, playerStatus);
    res.json({ id: info.lastInsertRowid, name, role, style, basePrice, image: imagePath, status: playerStatus, soldPrice: 0, soldToTeamId: null });
});

app.put('/api/players/:id', (req, res) => {
    const { id } = req.params;
    const { status, soldPrice, soldToTeamId } = req.body;
    console.log(`[UPDATE] Player ${id} - Body:`, req.body);

    // Dynamic update based on provided fields
    let query = 'UPDATE players SET ';
    const params = [];
    const updates = [];

    if (status) { updates.push('status = ?'); params.push(status); }
    if (req.body.style) { updates.push('style = ?'); params.push(req.body.style); } // Fix: access style from req.body
    if (soldPrice !== undefined) { updates.push('soldPrice = ?'); params.push(soldPrice); }
    if (soldToTeamId !== undefined) { updates.push('soldToTeamId = ?'); params.push(soldToTeamId); }

    if (updates.length === 0) {
        console.log('[UPDATE] No changes provided');
        return res.json({ success: true }); // No updates
    }

    query += updates.join(', ') + ' WHERE id = ?';
    params.push(id);

    console.log(`[UPDATE] Query: ${query}, Params:`, params);

    try {
        const stmt = db.prepare(query);
        const info = stmt.run(...params);
        console.log(`[UPDATE] Changes: ${info.changes}`);
        res.json({ success: true, changes: info.changes });
    } catch (err) {
        console.error("[UPDATE] Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/players/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM players WHERE id = ?').run(id);
    res.json({ success: true });
});

// --- Auction API ---
app.post('/api/auction/sell', (req, res) => {
    const { playerId, teamId, amount } = req.body;
    console.log(`[SELL] Processing sale - Player: ${playerId}, Team: ${teamId}, Amount: ${amount}`);

    try {
        const sellTransaction = db.transaction(() => {
            // 1. Update Player
            const updatePlayer = db.prepare('UPDATE players SET status = ?, soldPrice = ?, soldToTeamId = ? WHERE id = ?');
            const playerResult = updatePlayer.run('Sold', parseInt(amount), parseInt(teamId), parseInt(playerId));
            console.log(`[SELL] Player updated. Changes: ${playerResult.changes}`);

            // 2. Fetch Team logic
            const team = db.prepare('SELECT remainingBudget FROM teams WHERE id = ?').get(teamId);
            if (!team) {
                console.error(`[SELL] Team not found: ${teamId}`);
                throw new Error(`Team not found: ${teamId}`);
            }

            const currentBudget = team.remainingBudget;

            // Check for sufficient funds
            if (currentBudget < parseInt(amount)) {
                console.error(`[SELL] Insufficient funds: Team ${teamId} has ${currentBudget} but bid is ${amount}`);
                throw new Error(`Insufficient funds: Team has ${currentBudget}, bid is ${amount}`);
            }

            const newBudget = currentBudget - parseInt(amount);
            console.log(`[SELL] Budget update for Team ${teamId}: ${currentBudget} -> ${newBudget}`);

            // 3. Update Team Budget
            const updateTeam = db.prepare('UPDATE teams SET remainingBudget = ? WHERE id = ?');
            const teamResult = updateTeam.run(newBudget, parseInt(teamId));
            console.log(`[SELL] Team budget updated. Changes: ${teamResult.changes}`);

            return { newBudget };
        });

        // Execute transaction
        const result = sellTransaction();
        res.json({ success: true, ...result });

    } catch (error) {
        console.error("[SELL] Transaction failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const bcrypt = require('bcryptjs');

// --- Auth API ---
app.post('/api/auth/signup', (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, 8);
        const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
        const info = stmt.run(email, hashedPassword);
        res.json({ id: info.lastInsertRowid, email, success: true });
    } catch (err) {
        res.status(400).json({ error: 'Email already exists or invalid data' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) return res.status(404).json({ error: 'User not found' });

    const passwordIsValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordIsValid) return res.status(401).json({ error: 'Invalid password' });

    res.json({ id: user.id, email: user.email, role: user.role, token: 'fake-jwt-token-for-now' });
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve React Frontend (dist folder built from client)
app.use(express.static(path.join(__dirname, 'public')));

// ... (API Routes remain here) ...

// Catch-all route for React SPA (must be after API routes)
app.get(/.*/, (req, res) => {
    // Check if request is for API, if so, 404
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.options("*", (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "https://coffeeapp-45d44.web.app");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
});
const corsOptions = {
    origin: "https://coffeeapp-45d44.web.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

// Handle preflight requests first
// app.options("*", cors(corsOptions));

// Then apply cors for all routes
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.delete("/api/delete-user", async (req, res) => {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "Missing UID" });

    try {
        await admin.auth().deleteUser(uid);
        res.json({ message: `User ${uid} deleted successfully` });
    } catch (e) {
        console.error("Failed to delete user:", e);
        res.status(500).json({ error: e.message });
    }
});

app.post("/api/set-user-disabled", async (req, res) => {
    const { uid, disabled } = req.body;

    if (!uid || typeof disabled !== "boolean") {
        return res.status(400).json({ error: "Missing or invalid uid/disabled" });
    }

    try {
        await admin.auth().updateUser(uid, { disabled });
        res.json({ message: `User ${uid} has been ${disabled ? "disabled" : "enabled"}.` });
    } catch (e) {
        console.error("Failed to update disabled status:", e);
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

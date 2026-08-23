const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const LIB_DIR = path.join(__dirname, 'library', 'custom');

// Ensure library directory exists
if (!fs.existsSync(LIB_DIR)) {
    fs.mkdirSync(LIB_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve frontend files

// ─── API ENDPOINTS ───

// GET: Load all models from the library folder
app.get('/api/library', (req, res) => {
    try {
        const files = fs.readdirSync(LIB_DIR).filter(f => f.endsWith('.json'));
        const models = [];
        
        for (const file of files) {
            const filePath = path.join(LIB_DIR, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            try {
                models.push(JSON.parse(content));
            } catch (err) {
                console.error(`Error parsing ${file}:`, err);
            }
        }
        
        res.json(models);
    } catch (err) {
        console.error('Error reading library directory:', err);
        res.status(500).json({ error: 'Failed to read library.' });
    }
});

// POST: Save a model to the library folder
app.post('/api/library', (req, res) => {
    try {
        const model = req.body;
        if (!model || !model.name) {
            return res.status(400).json({ error: 'Invalid model data.' });
        }

        // Sanitize filename
        const safeName = model.name.replace(/[^a-z0-9_-]/gi, '_');
        const filePath = path.join(LIB_DIR, `${safeName}.json`);

        const isNew = !fs.existsSync(filePath);
        
        // Save model with timestamp
        model.savedAt = model.savedAt || new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(model, null, 4));

        res.json({ success: true, isNew: isNew });
    } catch (err) {
        console.error('Error saving model:', err);
        res.status(500).json({ error: 'Failed to save model.' });
    }
});

// DELETE: Remove a model from the library folder
app.delete('/api/library/:name', (req, res) => {
    try {
        const safeName = req.params.name.replace(/[^a-z0-9_-]/gi, '_');
        const filePath = path.join(LIB_DIR, `${safeName}.json`);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Model not found.' });
        }
    } catch (err) {
        console.error('Error deleting model:', err);
        res.status(500).json({ error: 'Failed to delete model.' });
    }
});

// ─── START SERVER ───
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(` SPICE Model Generator Backend Running!`);
    console.log(` Access the app at: http://localhost:${PORT}`);
    console.log(` Models are saved in: ${LIB_DIR}`);
    console.log(`========================================`);
});

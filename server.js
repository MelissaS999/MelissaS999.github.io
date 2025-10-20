const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Store messages in a simple JSON file (for learning purposes)
const MESSAGES_FILE = 'messages.json';

// Initialize messages file if it doesn't exist
async function initializeMessagesFile() {
    try {
        await fs.access(MESSAGES_FILE);
    } catch (error) {
        await fs.writeFile(MESSAGES_FILE, '[]', 'utf8');
    }
}

// API Routes
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online',
        message: 'MelissaS999 backend server is running!',
        timestamp: new Date().toISOString()
    });
});

// Handle contact form submissions
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        // Basic validation
        if (!name || !email || !message) {
            return res.status(400).json({ 
                error: 'All fields are required' 
            });
        }

        // Read existing messages
        const messagesData = await fs.readFile(MESSAGES_FILE, 'utf8');
        const messages = JSON.parse(messagesData);

        // Add new message
        const newMessage = {
            id: Date.now(),
            name,
            email,
            message,
            timestamp: new Date().toISOString()
        };

        messages.push(newMessage);

        // Save back to file
        await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));

        res.json({ 
            success: true, 
            message: 'Message received successfully!',
            id: newMessage.id
        });

    } catch (error) {
        console.error('Error handling contact form:', error);
        res.status(500).json({ 
            error: 'Server error. Please try again later.' 
        });
    }
});

// Get all messages (for admin purposes - in a real app, add authentication)
app.get('/api/messages', async (req, res) => {
    try {
        const messagesData = await fs.readFile(MESSAGES_FILE, 'utf8');
        const messages = JSON.parse(messagesData);
        res.json(messages);
    } catch (error) {
        console.error('Error reading messages:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
async function startServer() {
    await initializeMessagesFile();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Visit: http://localhost:${PORT}`);
    });
}

startServer().catch(console.error);

// Export for testing or other uses
module.exports = app;

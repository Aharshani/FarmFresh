const express = require('express');
const path = require('path');
const router = express.Router();

// Serve HTML pages
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, '../../public', `${page}.html`);
    res.sendFile(filePath);
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('chat', {
    layout: 'index',
    user: req.user.name
    })
}
);

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    layout: 'index',
    user: req.user.name
  })
);

module.exports = router;
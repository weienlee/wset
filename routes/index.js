var express = require('express');
var router = express.Router();
var utils = require('../util/utils.js');

// GET home page
router.get('/', function(req, res) {
    res.render('index', {
        title: 'wset',
    });
});

module.exports = router;

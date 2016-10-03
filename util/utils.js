// utils

var express = require('express');
var ObjectID = require('mongodb').ObjectID;

var utils = {};

/*
 * Send a 200 OK with success:true in the request body to the response argument provided. The caller
 * of this function should return after calling
 */
utils.sendSuccessResponse = function(res, content) {
    res.status(200).json({
        success: true,
        content: content
    }).end();
};

/*
 * Send an error code with success:false and error message as provided in the arguments to the
 * response argument provided. The caller of this function should return after calling.
 */
utils.sendErrResponse = function(res, errcode, err) {
    res.status(errcode).json({
        success: false,
        err: err
    }).end();
};

/*
 * Middleware function that sends an error if the user is not logged in.
 */
utils.requireLogin = function(req, res, next) {
    if (!req.session.username) {
        utils.sendErrResponse(res, 403, 'You must be logged in to perform this action');
    } else {
        next();
    }
}

/*
 * Middleware function for admin access
 */
utils.checkAdmin = function(req, res, next) {
    if (req.session.username == "weienlee" || req.session.username == "user") {
        next();
    } else {
        utils.sendErrResponse(res, 403, 'You are not authorized to perform this action');
    }
}



/*
 * Middleware function that redirects to the login page if the user is not logged in.
 */
utils.redirectLogin = function(req, res, next) {
    if (!req.session.username) {
        res.redirect('/');
    } else {
        next();
    }
}

/*
 * Gets username if logged in
 */
utils.getAuth = function(session) {
    if (session.username) {
        return session.username;
    } else {
        return false;
    }
}

/*
 * Checks if provided username matches authentication string
 */
utils.checkAuth = function(session, auth) {
    return session.username === auth;
}

/*
 * Check if username and password are valid
 */
utils.checkUserDetails = function(res, username, password, success) {
    if (!username || !password) {
        utils.sendErrResponse(res, 403, 'You must enter a username and password.');
    } else if (typeof(username) != 'string' || typeof(password) != 'string') {
        utils.sendErrResponse(res, 403, 'Form inputs are of the wrong type.');
    } else {
        success();
    }
}

module.exports = utils;

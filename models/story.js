var mongoose = require('mongoose');
var User = require('./user.js');
var Comment = require('./comment.js');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var storySchema = new Schema({
    text: String,
    image: String,
    user_id: {type: ObjectId, ref: 'User'},
    username: String,
    createdAt: {type: Date, default: Date.now},
    is_active: Boolean,
    points: {type: Number, default: 0},
    tags: [String],
    comments: [{type: ObjectId, ref: 'Comment'}]
});

// get all stories
storySchema.statics.getAll = function(callback) {
    Story.find({}, function(err, stories){
        if (err) {
            callback({code: 500, err: 'Unknown error'});
        } else {
            callback({code: 200, data: stories});
        }
    });
};

// get stories by params
storySchema.statics.getStories = function(tag, is_active, start_date, callback){
    // if no start_date is specified, just use right now
    if (!start_date) {
        start_date = new Date();
    }
    if (tag) {
        // find stories with matching tag
        Story.find({is_active: is_active, tags: tag, createdAt: {$lt: start_date}})
            .sort({createdAt:'desc'})
            .limit(50)
            .exec(function(err, docs){
                if (err){
                    callback({code: 500, err: 'Unknown error'});
                } else {
                    callback({code: 200, data:docs});
                }
            });
    } else {
        // just get all stories
        Story.find({is_active: is_active, createdAt: {$lt: start_date}})
            .sort({createdAt:'desc'})
            .limit(50)
            .exec(function(err, docs){
                if (err){
                    callback({code: 500, err: 'Unknown error'});
                } else {
                    callback({code: 200, data:docs});
                }
            });
    }
};

// create new story
storySchema.statics.createNew = function(text, image, user_id, username, tags, callback){
    if (text == "") {
        callback({code: 403, err: 'You cannot leave the text blank'});
    } else if (image == "") {
        callback({code: 403, err: 'Please upload a picture'});
    } else {
        var story = new Story({
            text: text,
            image: image,
            user_id: user_id,
            username: username,
            is_active: true,
            tags: tags
        });
        story.save(function(err, result) {
            if (err) {
                callback({code: 500, err: 'Could not create story'});
            } else {
                callback({code: 200, data: result});
            }
        });
    }
}

// get story by id
storySchema.statics.getStory = function(story_id, callback) {
    Story.findById(story_id)
        .populate('comments')
        .exec(function (err, story) {
            if (err) {
                callback({code: 500, err: 'Unknown error'});
            } else if (!story) {
                callback({code: 404, err: 'Could not find story'});
            } else {
                callback({code: 200, data: story});
            }
        });
}

// archive story
storySchema.statics.archiveStory = function(story_id, callback) {
    Story.findById(story_id, function(err, story) {
        if (err) {
            callback({code: 500, err: 'Unknown error'});
        } else if (!story) {
            callback({code: 404, err: 'Could not find story'});
        } else {
            story.is_active = false;
            story.save(function(err, result) {
                if (err) {
                    callback({code: 500, err: 'Could not set is_active to false'});
                } else {
                    callback({code: 200, data: result});
                }
            });
        }
    });
}

// update tags
storySchema.statics.updateTags = function(story_id, tags_list, callback) {
    Story.findById(story_id, function(err, story) {
        if (err) {
            callback({code: 500, err: 'Unknown error'});
        } else if (!story) {
            callback({code: 404, err: 'Could not find story'}); 
        } else {
            story.tags = tags_list;
            story.save(function(err, result) {
                if (err) {
                    callback({code: 500, err: 'Could not set is_active to false'});
                } else {
                    callback({code: 200, data: result});
                }
            });
        }
    });
};

// update text
storySchema.statics.updateText = function(story_id, username, text, callback) {
    if (text == "") {
        callback({code: 403, err: 'You cannot leave the text blank'});
    } else {
        Story.findById(story_id, function(err, story) {
            if (err) {
                callback({code: 500, err: 'Unknown error'});
            } else if (!story) {
                callback({code: 404, err: 'Could not find story'}); 
            } else {
                if (story.username == username) {
                    // check for authentication
                    story.text = text;
                    story.save(function(err, result) {
                        if (err) {
                            callback({code: 500, err: 'Could not set update text'});
                        } else {
                            callback({code: 200, data: result});
                        }
                    });
                } else {
                    callback({code: 403, err: 'Operation unauthorized'});
                }
            }
        });
    }
};

// add comment
storySchema.statics.addComment = function(story_id, comment_id, callback) {
    Story.findById(story_id, function(err, story) {
        if (err) {
            callback({code: 500, err: 'Unknown error'});
        } else if (!story) {
            callback({code: 404, err: 'Could not find story'});
        } else {
            story["comments"].push(comment_id);
            story.save(function(err, result) {
                if (err) {
                    callback({code: 500, err: 'Could not add comment to story'});
                } else {
                    callback({code: 200, data: result});
                }
            });
        }
    });
};

// remove comment
storySchema.statics.removeComment = function(story_id, comment_id, callback) {
    Story.findById(story_id, function(err, story) {
        if (err) {
            callback({code: 500, err: 'Unknown error'});
        } else if (!story) {
            callback({code: 404, err: 'Could not find story'});
        } else {
            var index = story["comments"].indexOf(comment_id);
            story["comments"].splice(index, 1);
            story.save(function(err, result) {
                if (err) {
                    callback({code: 500, err: 'Could not remove comment from story'});
                } else {
                    callback({code: 200, data: result});
                }
            });   
        }
    });
}

// update points
storySchema.statics.updatePoints = function(story_id, change, callback) {
    Story.findById(story_id, function(err, story) {
        if (err) {
            callback({code: 500, err: 'Unknown error'});
        } else if (!story) {
            callback({code: 404, err: 'Could not find story'});
        } else {
            story.points += change;
            story.save(function(err, result) {
                if (err) {
                    callback({code: 500, err: 'Could not set is_active to false'});
                } else {
                    callback({code: 200, data: result});
                }
            });
        }
    });
}


var Story = mongoose.model('Story', storySchema);
module.exports = Story;

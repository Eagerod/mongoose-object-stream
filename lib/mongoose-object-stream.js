"use strict";

var stream = require("stream");

function MongooseObjectStream(mongoose, modelName, schema, options) {
    // Parameters
    if ( mongoose.constructor.name === "Function" ) { // mongoose is the model.
        this.Model = mongoose;
        options = modelName;
    }
    else { // Full parameter list.
        var modelSchema = new mongoose.Schema(schema, options);
        this.Model = mongoose.model(modelName, modelSchema);
    }

    options = options || {};
    options.objectMode = true;
    stream.Writable.call(this, options);
}

MongooseObjectStream.prototype = Object.create(stream.Writable.prototype);

MongooseObjectStream.prototype._write = function(chunk, encoding, callback) {
    if ( typeof chunk === "string" ) {
        chunk = JSON.parse(chunk);
    }
    new this.Model(chunk).save(function() { // Always provide callback so it doesn't throw
        if ( callback ) {
            callback();
        }
    });
    return true;
};

module.exports = MongooseObjectStream;

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

    this.upserts = options.upsert;
    if ( this.upserts ) {
        delete options.upsert;
    }

    options.objectMode = true;
    stream.Writable.call(this, options);
}

MongooseObjectStream.prototype = Object.create(stream.Writable.prototype);

MongooseObjectStream.prototype._write = function(chunk, encoding, callback) {
    if ( typeof chunk === "string" ) {
        chunk = JSON.parse(chunk);
    }

    if ( this.upserts ) {
        var id = chunk._id;
        if ( id ) {
            delete chunk._id;
            this.Model.update({_id: id}, chunk, {upsert: true}, callback);
            return true;
        }
    }

    new this.Model(chunk).save(callback);
    return true;
};

module.exports = MongooseObjectStream;

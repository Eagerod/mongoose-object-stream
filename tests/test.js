"use strict";

var mongoose = require("mongoose");
var async = require("async");
var mock = require("nodeunit-mock");

var MongooseObjectStream = require("..");

var Tests = module.exports;
var Setup = Tests["Setup Tests"] = {};
var CreationTests = Tests["Creation Tests"] = {};
var BehaviorTests = Tests["Behavior Tests"] = {};
var UpsertTests = BehaviorTests["Upsert Tests"] = {};
var TearDown = Tests["Tear Down Tests"] = {};

Setup["Connect Mongoose"] = function(test) {
    mongoose.connect("mongodb://localhost:27017/mostestdb");
    mongoose.connection.on("open", function() {
        test.done();
    });
};

CreationTests["With all params"] = function(test) {
    test.expect(5);
    var modelInfo = {
        "akey": String,
        "bkey": Date
    };
    var options = {
        strict: false
    };
    var stream = new MongooseObjectStream(mongoose, "AModel", modelInfo, options);
    test.equal(mongoose.models.AModel, stream.Model);
    test.equal(mongoose.models.AModel.modelName, "AModel");
    test.equal(mongoose.models.AModel.schema.options.strict, false);
    test.equal(mongoose.models.AModel.schema.paths.akey.instance, "String");
    test.equal(mongoose.models.AModel.schema.paths.bkey.instance, "Date");
    test.done();
};

CreationTests["Just existing model"] = function(test) {
    test.expect(1);
    var schema = new mongoose.Schema({akey: String, bkey: Date});
    var model = mongoose.model("BModel", schema);
    var stream = new MongooseObjectStream(model);
    test.equal(mongoose.models.BModel, stream.Model);
    test.done();
};

BehaviorTests.setUp = function(done) {
    this.model = mongoose.connection.base.models.BModel;

    async.each(Object.keys(mongoose.connection.base.models), function(ent, cb) {
        mongoose.connection.base.models[ent].remove({}, cb);
    }, done);
};

BehaviorTests["String Test"] = function(test) {
    test.expect(4);
    var stream = new MongooseObjectStream(this.model);

    var date = new Date();
    stream.write(JSON.stringify({akey: "stringythingy", bkey: date}));
    stream.end();
    stream.on("finish", function() {
        stream.Model.find(function(err, models) {
            test.ifError(err);
            test.equal(models.length, 1);
            test.equal(models[0].akey, "stringythingy");
            test.deepEqual(models[0].bkey, date);
            test.done();
        });
    });
};

BehaviorTests["Object Test"] = function(test) {
    test.expect(4);
    var stream = new MongooseObjectStream(this.model);

    var date = new Date();
    stream.write({akey: "stringythingy", bkey: date});
    stream.end();
    stream.on("finish", function() {
        stream.Model.find(function(err, models) {
            test.ifError(err);
            test.equal(models.length, 1);
            test.equal(models[0].akey, "stringythingy");
            test.deepEqual(models[0].bkey, date);
            test.done();
        });
    });
};

BehaviorTests["Batch Test"] = function(test) {
    test.expect(2 + 5 * 2);
    var stream = new MongooseObjectStream(this.model);

    var dates = [];
    var now = new Date();
    for ( var i = 0; i < 5; ++i ) {
        var date = new Date(Math.random() * now.getTime());
        dates.push(date);
        stream.write({akey: "stringythingy", bkey: date});
    }
    stream.end();
    stream.on("finish", function() {
        stream.Model.find(function(err, models) {
            test.ifError(err);
            test.equal(models.length, 5);
            for ( var i = 0; i < 5; ++i ) {
                test.equal(models[i].akey, "stringythingy");
                test.deepEqual(models[i].bkey, dates[i]);
            }
            test.done();
        });
    });
};

UpsertTests.setUp = function(done) {
    if ( mongoose.connection.base.models.CModel ) {
        this.model = mongoose.connection.base.models.CModel;
    }
    else {
        var schema = new mongoose.Schema({_id: String, akey: String});
        var model = mongoose.model("CModel", schema);
        this.model = model;
    }

    async.each(Object.keys(mongoose.connection.base.models), function(ent, cb) {
        mongoose.connection.base.models[ent].remove({}, cb);
    }, done);
};

UpsertTests["Success"] = function(test) {
    test.expect(6);
    var stream = new MongooseObjectStream(this.model, {upsert: true});
    var entity = new this.model({_id: "a"});
    entity.save(function(err) {
        test.ifError(err);
        test.equal(entity.akey, undefined);
        stream.write({_id: "a", akey: "b"});
        stream.end();
        stream.on("finish", function() {
            stream.Model.find(function(err, models) {
                test.ifError(err);
                test.equal(models.length, 1);
                test.equal(models[0]._id, "a");
                test.equal(models[0].akey, "b");
                test.done();
            });
        });
    });
};

UpsertTests["Success no _id"] = function(test) {
    test.expect(3);
    this.model = mongoose.connection.base.models.BModel; // autogen id.
    var stream = new MongooseObjectStream(this.model, {upsert: true});
    stream.write({akey: "b"});
    stream.on("finish", function() {
        stream.Model.find(function(err, models) {
            test.ifError(err);
            test.equal(models.length, 1);
            test.equal(models[0].akey, "b");
            test.done();
        });
    });
    stream.end();
};

TearDown["Disconnect Mongoose"] = function(test) {
    mongoose.connection.close(function() {
        test.done();
    });
};

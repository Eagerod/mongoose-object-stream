# Mongoose Object Stream

Super simple package that wraps up a Mongoose Model into a stream so that you can pipe results of other operations right into a Mongo Database.

It uses a set-it-and-forget-it kind of pattern, but as is with any stream, you can end it and wait for a finish event.

This works really well if you need to throw a writable stream into a Bunyan logger, which is where I first created this.

## Usage

There are two ways of creating a stream. 
The easiest of the two ways is to pass in a model to the stream constructor:

    // assuming you've defined/imported `someModel` already.
    var modelStream = new MongooseObjectStream(someModel);

Alternatively, you can define the model in the stream constructor. 

    var modelStream = new MongooseObjectStream(mongoose, "ModelName", {key: String}, {strict: false});

In both of these cases, you'll have a stream that you can use to write either strings or objects to directly.

    modelStream.write({key: "value"});
    modelStream.write('{"key": "another value"}');

It will parse out any strings that are passed to it, in case your data source provides strings rather objects. 

## Caveats

There's no error handling yet, so if you pass in a non-JSON string to the stream, it'll blow up.

# Mongoose Object Stream
Super simple package that wraps up a Mongoose Model into a stream so that you can pipe results of other operations right into a Mongo Database.

It uses a set-it-and-forget-it kind of pattern, but as is with any stream, you can end it and wait for a finish event.

This works really well if you need to throw a writable stream into a Bunyan logger, which is where I first created this.

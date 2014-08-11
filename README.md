keytag
======

Student attendance tracking system using Node.js and MongoDB

Private Query System
====================

Revision 0.1

Note: This is not the Public Query API, which will be higher-level and is planned for development during and after prototyping.  This Query API is for low-level access, as it is essentially a restricted RPC system for mongoose, and is for testing and private (i.e. trusted) access.  Details of how this will interact with the public API are expected to evolve according to use during prototyping.

The Private Query API is accessed via HTTP by sending a POST request to the server on the '/query' path.  The body of the POST request should contain a single JSON object that specifies the query.

Query Format:

Mongoose builds up queries by chaining of functions on a Query JavaScript Object.  Each function supplies a query parameter or set of parameters, for example, we might search for a Student with first name 'John'.  A valid mongoose query would look like:

Student.find().where('name.first', 'John').exec()

We specify the Model (Student), then pass the parameters of the query.  .exec() executes the query, and should be omitted when passing to the HTTP service.  Execution is handled internally, and server will kick back an error if exec is passed as a function call (this is a security feature, as queries may be rewritten by the server to prevent leaking private data to unauthorized users.)

The JSON query that performs the above is:

{
  "model" : "Student",
  "query" : {
    "op" : "find",
    "args" : [],
    "next" : {
      "op" : "where"
      "args" : ["name.first", "John"]
      }
   }
}

That is, the query request should contain two fields: the model to be queried against, and the query itself.  The query takes the form of a recursive tree, similar to the AST of a Lisp S-expression, or alternatively that of a linked list, since only the "next" field can be expanded.  Each level of the query should contain two or three fields: "op" specfies the query operation to be executed, and "args" should be an array of arguments to be passed to the "op" function.  Function chaining is represented by the "next" field, which is again a query object containing an "op" field, an "args" field, and an optional "next" field.

The query parser works by matching keys; any fields other than these three will be ignored in a query, and the parser stops operation and passes the query on for execution when it cannot find a "next" field.  Invalid operations or parameters will kick back an error under current behavior.  Error behavior will be addressed in future revisions.

Valid operations are mongoose Query.js functions that are nullipotent (have no side effects), and thus this interface does not allow adding to, deleting from, or updating the database.  Queries are fired asynchronously and use a thread pool to perform their actions, so anything that writes to the database should instead be handled by the dedicated databaseWriter, which handles scheduling and execution of writes to the database in a safe manner.  Additionally, some query option functions are restricted, as they will be handled by the server itself, and are not exposed to the user.

Valid operations are:

all,
and,
box,
circle,
comment,
elemMatch,
equals,
exists,
geometry,
gt,
gte,
hint,
in,
intersects,
lean,
limit,
lt,
lte,
maxDistance,
maxScan,
mod,
ne,
near,
nearSphere,
nin,
nor,
or,
polygon,
populate,
regex,
select,
size,
skip,
slice,
snapshot,
sort,
where,
within

Details on these functions can be found at: http://mongoosejs.com/docs/api.html#query-js

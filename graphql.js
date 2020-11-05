var { graphql, buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello: String
    data: String
  }
`);

// The root provides a resolver function for each API endpoint
var root = {
    hello: () => {
        return 'Hello world!';
    },
    data: () => {
        return 'this is data!';
    },

};

// Run the GraphQL query '{ hello }' and print out the response
graphql(schema, '{ data }', root).then((response) => {
    console.log(response);
});
import { GraphQLServer } from "graphql-yoga";

//Type definitions (schema)
const typeDefs = `
    type Query {
        hello: String!
        name: String!
    }
`;

//Resolvers
const resolvers = {
  Query: {
    hello() {
      return "Example of first query";
    },
    name() {
      return "Erick Rex";
    },
  },
};

const server = new GraphQLServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

server.start(() => {
  console.log("The server is up!");
});

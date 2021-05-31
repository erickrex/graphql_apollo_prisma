import { GraphQLServer } from "graphql-yoga";
import db from "./db";
import Query from "./resolvers/Query";
import Mutation from "./resolvers/Mutation";
import Subscription from "./resolvers/Subscription";
import User from "./resolvers/User";
import Post from "./resolvers/Post";
import Comment from "./resolvers/Comment";

// Type definitions (schema)
// everything inside an input type needs to be an scalar, you cannot have another custom object type inside the arguments atributes
// this is a unidirectional relationship -- > author: User!
//TYPEDEFS MOVED TO SCHEMA.GRAPHQL

const server = new GraphQLServer({
  //typeDefs: typeDefs,
  typeDefs: "./src/schema.graphql",
  resolvers: {
    Query,
    Mutation,
    Subscription,
    User,
    Post,
    Comment,
  },
  context: {
    db: db,
    pubsub,
  },
});

server.start(() => {
  console.log("The server is up!");
});

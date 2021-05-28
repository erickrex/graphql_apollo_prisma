import { GraphQLServer } from "graphql-yoga";
import { posts } from "./posts";
import { users } from "./users";

//Type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        me: User!
        }

    type User {
        id: ID!
        name: String!
        email: String
        age: Int
        posts: [Post!]!
    }
    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
    }
`;
//this is a unidirectional relationship -- > author: User!

//Resolvers
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users;
      }
      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },
    posts(parent, args, ctx, info) {
      if (args.query) {
        return posts.filter((post) => {
          const query_in_title = post.title
            .toLowerCase()
            .includes(args.query.toLowerCase());
          const query_in_body = post.body
            .toLowerCase()
            .includes(args.query.toLowerCase());

          return query_in_title || query_in_body;
        });
      } else return posts;
    },
    me() {
      return {
        id: "123456789",
        name: "Rico",
        email: "rick@rico.com",
        age: 29,
      };
    },
  },
  //relational data for each type
  //post is the parent argument
  Post: {
    author(parent, args, ctx, info) {
      //parent.author exists here
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return post.author == parent.id;
      });
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

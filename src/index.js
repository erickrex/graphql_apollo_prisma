import { GraphQLServer } from "graphql-yoga";
import { posts } from "./posts";
import { users } from "./users";
import { comments } from "./comments";
import uuidv4 from "uuid/v4";
//Type definitions (schema)
//everything inside an input type needs to be an scalar, you cannot have another custom object type inside the arguments atributes
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        me: User!
        comments : [Comment!]!
        }
    
    type Mutation {
        createUser(data: CreateUserInput!) : User!
        deleteUser(id: ID!): User!

        createPost(data: CreatePostInput!) : Post! 
        createComment(data: CreateCommentInput!) : Comment!

    }
    
    input CreateUserInput {
        name: String!
        email: String!
        age: Int!
    }
    input CreatePostInput {
        title: String!
        body: String!
        published: Boolean! 
        author: ID!
    }
    input CreateCommentInput {
        text: String!
        author: ID!
        post: ID!
    }

    type User {
        id: ID!
        name: String!
        email: String
        age: Int
        posts: [Post!]!
        comments : [Comment!]!
    }
    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
        author: User!
        comments: [Comment!]!
    }
    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
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
    comments(parent, args, ctx, info) {
      return comments;
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
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some((user) => user.email === args.data.email);
      if (emailTaken) {
        throw new Error("Email taken!");
      }
      const user = {
        id: uuidv4(),
        ...args.data,
      };
      users.push(user);
      return user;
    },
    deleteUser(parent, args, ctx, info) {
      const userIndex = users.findIndex((user) => user.id === args.id);
    },
    createPost(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.data.author);
      if (!userExists) {
        throw new Error("User not found");
      }
      const post = {
        id: uuidv4(),
        ...args.data,
      };
      posts.push(post);
      return post;
    },
    createComment(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id === args.data.author);
      if (!userExists) {
        throw new Error("User not found");
      }

      const postExistAndPublished = posts.some(
        (post) => post.id === args.data.post && post.published
      );

      if (!postExistAndPublished) {
        throw new Error("Post does not exist or is not published");
      }

      const comment = {
        id: uuidv4(),
        ...args.data,
      };

      comments.push(comment);
      return comment;
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
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        //the comment.post value is the id
        return comment.post === parent.id;
      });
    },
  },
  Comment: {
    author(parent, args, ctx, info) {
      //parent.author exists here
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    post(parent, args, ctx, info) {
      return posts.find((post) => {
        return post.id === parent.post;
      });
    },
  },
  User: {
    //one users has many posts
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => {
        return comment.author === parent.id;
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

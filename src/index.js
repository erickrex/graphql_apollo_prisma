import { GraphQLServer } from "graphql-yoga";
import uuidv4 from "uuid/v4";
import db from "./db";

// Type definitions (schema)
// everything inside an input type needs to be an scalar, you cannot have another custom object type inside the arguments atributes
// this is a unidirectional relationship -- > author: User!
//TYPEDEFS MOVED TO SCHEMA.GRAPHQL

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
      if (userIndex === -1) {
        throw new Error("User not found");
      }

      const deletedUsers = users.splice(userIndex, 1);
      //delete posts created by the user
      posts = posts.filter((post) => {
        const match = post.author === args.id;
        //delete comments inside that post, from other/any users
        if (match) {
          comments = comments.filter((comment) => comment.post !== post.id);
        }
        return !match;
      });
      //delete comments created by the user in other posts
      comments = comments.filter((comment) => comment.author !== args.id);

      return deletedUsers[0];
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
    deletePost(parent, args, ctx, info) {
      const postIndex = posts.findIndex((post) => post.id == args.id);

      if (postIndex === -1) {
        throw new Error("Post not found");
      }

      const deletedPosts = posts.splice(postIndex, 1);

      comments = comments.filter((comment) => comment.post !== args.id);
      return deletedPosts[0];
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
    deleteComment(parent, args, ctx, info) {
      const commentIndex = comments.findIndex(
        (comment) => comment.id == args.id
      );

      if (commentIndex === -1) {
        throw new Error("Comment not found");
      }

      const deletedComments = comments.splice(commentIndex, 1);

      return deletedComments[0];
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
  //typeDefs: typeDefs,
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: {
    db: db,
  },
});

server.start(() => {
  console.log("The server is up!");
});

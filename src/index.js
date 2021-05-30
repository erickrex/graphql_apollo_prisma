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
    users(parent, args, { db }, info) {
      if (!args.query) {
        return db.users;
      }
      return db.users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },
    posts(parent, args, { db }, info) {
      if (args.query) {
        return db.posts.filter((post) => {
          const query_in_title = post.title
            .toLowerCase()
            .includes(args.query.toLowerCase());
          const query_in_body = post.body
            .toLowerCase()
            .includes(args.query.toLowerCase());

          return query_in_title || query_in_body;
        });
      } else return db.posts;
    },
    comments(parent, args, { db }, info) {
      return db.comments;
    },
    me() {
      return {
        id: "123456789",
        name: "Rico",
        email: "rick@rico.com",
        age: 29,
      };
    },
    post() {
      return {
        id: "092",
        title: "POST TITLE HIER",
        body: "",
        published: false,
      };
    },
  },
  Mutation: {
    createUser(parent, args, { db }, info) {
      const emailTaken = db.users.some(
        (user) => user.email === args.data.email
      );
      if (emailTaken) {
        throw new Error("Email taken!");
      }
      const user = {
        id: uuidv4(),
        ...args.data,
      };
      db.users.push(user);
      return user;
    },
    deleteUser(parent, args, { db }, info) {
      const userIndex = db.users.findIndex((user) => user.id === args.id);
      if (userIndex === -1) {
        throw new Error("User not found");
      }

      const deletedUsers = db.users.splice(userIndex, 1);
      //delete posts created by the user
      db.posts = db.posts.filter((post) => {
        const match = post.author === args.id;
        //delete comments inside that post, from other/any users
        if (match) {
          db.comments = db.comments.filter(
            (comment) => comment.post !== post.id
          );
        }
        return !match;
      });
      //delete comments created by the user in other posts
      db.comments = db.comments.filter((comment) => comment.author !== args.id);

      return deletedUsers[0];
    },
    createPost(parent, args, { db }, info) {
      const userExists = db.users.some((user) => user.id === args.data.author);
      if (!userExists) {
        throw new Error("User not found");
      }
      const post = {
        id: uuidv4(),
        ...args.data,
      };
      db.posts.push(post);
      return post;
    },
    deletePost(parent, args, { db }, info) {
      const postIndex = db.posts.findIndex((post) => post.id == args.id);

      if (postIndex === -1) {
        throw new Error("Post not found");
      }

      const deletedPosts = db.posts.splice(postIndex, 1);

      db.comments = db.comments.filter((comment) => comment.post !== args.id);
      return deletedPosts[0];
    },
    createComment(parent, args, { db }, info) {
      const userExists = db.users.some((user) => user.id === args.data.author);
      if (!userExists) {
        throw new Error("User not found");
      }
      const postExistAndPublished = db.posts.some(
        (post) => post.id === args.data.post && post.published
      );
      if (!postExistAndPublished) {
        throw new Error("Post does not exist or is not published");
      }
      const comment = {
        id: uuidv4(),
        ...args.data,
      };
      db.comments.push(comment);
      return comment;
    },
    deleteComment(parent, args, { db }, info) {
      const commentIndex = db.comments.findIndex(
        (comment) => comment.id == args.id
      );

      if (commentIndex === -1) {
        throw new Error("Comment not found");
      }

      const deletedComments = db.comments.splice(commentIndex, 1);

      return deletedComments[0];
    },
  },
  //relational data for each type
  //post is the parent argument
  Post: {
    author(parent, args, { db }, info) {
      //parent.author exists here
      return db.users.find((user) => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, { db }, info) {
      return db.comments.filter((comment) => {
        //the comment.post value is the id
        return comment.post === parent.id;
      });
    },
  },
  Comment: {
    author(parent, args, { db }, info) {
      //parent.author exists here
      return db.users.find((user) => {
        return user.id === parent.author;
      });
    },
    post(parent, args, { db }, info) {
      return db.posts.find((post) => {
        return post.id === parent.post;
      });
    },
  },
  User: {
    //one users has many posts
    posts(parent, args, { db }, info) {
      return db.posts.filter((post) => {
        return post.author === parent.id;
      });
    },
    comments(parent, args, { db }, info) {
      return db.comments.filter((comment) => {
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

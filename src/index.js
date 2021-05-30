import { GraphQLServer } from "graphql-yoga";
//import { posts } from "./posts";
import { users } from "./users";
//import { comments } from "./comments";
import uuidv4 from "uuid/v4";

let posts = [
  {
    id: "1",
    title: "Don Quijotess",
    body: "En un lugar de la Mancha de cuyo nombre no quiero acordarme",
    published: true,
    author: "1",
  },
  {
    id: "2",
    title: "El cid",
    body: "Erase una vez un patito feo que se convirtio en un Ogro verde. Luego salvo a la princesa y todos vivieron felices por siempre.",
    published: false,
    author: "1",
  },
  {
    id: "3",
    title: "Mi noches de soledad",
    body: "Quizas amaste a quien no debiste amar, tomaste una decision fatal, te lastimaron y eso to hizo mal. Y yo lo tuve que pagar. QUIZAS!!",
    published: true,
    author: "2",
  },
];

let comments = [
  {
    id: "1",
    text: "Austin 3:16 says I just whipped your ass",
    author: "1",
    post: "1",
  },
  {
    id: "2",
    text: "Can you smell what the Rock is cooking",
    author: "2",
    post: "2",
  },
  {
    id: "3",
    text: "To be the man you have to beat the man Woooooo",
    author: "2",
    post: "2",
  },
  {
    id: "4",
    text: "There is only one word to describe you S A W F T saaaawft",
    author: "3",
    post: "3",
  },
];

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
        deletePost(id: ID!): Post! 

        createComment(data: CreateCommentInput!) : Comment!
        deleteComment(id: ID!): Comment!
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
  typeDefs: typeDefs,
  resolvers: resolvers,
});

server.start(() => {
  console.log("The server is up!");
});

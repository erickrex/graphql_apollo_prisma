import { GraphQLServer } from "graphql-yoga";

//Demo user data
const users = [
  {
    id: "1",
    name: "Don Rick",
    email: "rick@rico.com",
    age: 29,
  },
  {
    id: "2",
    name: "Patricio",
    email: "pat@tricio.com",
    age: 18,
  },
  {
    id: "Sandy",
    name: "Sandy",
    email: "sandy@sand.com",
  },
];

const posts = [
  {
    id: "1",
    title: "Don Quijote",
    body: "En un lugar de la Mancha de cuyo nombre no quiero acordarme",
    published: true,
  },
  {
    id: "2",
    title: "El cid",
    body: "Erase una vez un patito feo que se convirtio en un Ogro verde. Luego salvo a la princesa y todos vivieron felices por siempre.",
    published: false,
  },
  {
    id: "3",
    title: "Mi noches de soledad",
    body: "Quizas amaste a quien no debiste amar, tomaste una decision fatal, te lastimaron y eso to hizo mal. Y yo lo tuve que pagar. QUIZAS!!",
    published: true,
  },
];
//Type definitions (schema)
const typeDefs = `
    type Query {
        users(query: String): [User!]!
        posts(query: String): [Post!]!
        me: User!
        post: Post!
        }

    type User {
        id: ID!
        name: String!
        email: String
        age: Int
    }
    type Post {
        id: ID!
        title: String!
        body: String!
        published: Boolean!
    }
`;

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
    post() {
      return {
        id: "984",
        title: "Homepage",
        body: "Example of a post",
        published: false,
      };
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

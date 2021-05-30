const Query = {
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
};

export { Query as default };

const Post = {
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
};

export { Post as default };

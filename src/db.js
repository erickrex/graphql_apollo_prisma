const users = [
  {
    id: "1",
    name: "Enrique",
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
    id: "3",
    name: "Sandy",
    email: "sandy@sand.com",
  },
];

const posts = [
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

const comments = [
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

const db = {
  users,
  posts,
  comments,
};

export { db as default };

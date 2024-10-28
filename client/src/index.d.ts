interface ILessDeck {
  _id: string;
  name: string;
  dateUpdated: string;
  isPrivate: boolean;
}

interface IMoreDeck {
  owner: string;
  name: string;
  description: string;
  dateCreated: string;
  dateUpdated: string;
  cards: string[];
  isPrivate: boolean;
  isEditable: boolean;
  likes: number;
}

interface ICard {
  question: string;
  answer: string;
  hint: string;
  deck: string;
}

interface ICustomResponse<T> {
  status: string;
  message: string;
  data: T;
}

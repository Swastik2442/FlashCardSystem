interface IUser {
  fullName: string;
  username: string;
}

interface IUserWithID extends IUser {
  _id: string;
}

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
  isPrivate: boolean;
  isEditable: boolean;
  likes: number;
  isLiked: boolean;
}

interface ICard {
  _id: string;
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

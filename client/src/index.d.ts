type Nullable<T> = T | null;

interface IUser {
  fullName: string;
  username: string;
}

interface IUserWithID extends IUser {
  readonly _id: string;
}

interface IUserPrivate extends IUser {
  email: string;
}

interface ILessDeck {
  readonly _id: string;
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
  readonly _id: string;
  question: string;
  answer: string;
  hint: string;
  deck: string;
}

type ILessCard = Omit<ICard, "deck">;

interface ICustomResponse<T> {
  readonly status: string;
  readonly message: string;
  data: T;
}

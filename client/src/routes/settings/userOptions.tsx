import { getUserPrivate } from "@/api/user";

type IUserOptionsData = Omit<IUser, "email" | "username">

export async function UserOptionsLoader(): Promise<IUserOptionsData> {
  const userDetails = await getUserPrivate();
  return userDetails;
}

export function UserOptions({ data }: { data: IUserOptionsData }) {
  return (
    <div>
      <UserDetailsSection userDetails={data} />
    </div>
  )
}

function UserDetailsSection({ userDetails }: { userDetails: IUserOptionsData }) {
  return (
    <div>
      {userDetails.fullName}
    </div>
  );
}

export default UserOptions

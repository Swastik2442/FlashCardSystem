import { useParams } from "react-router-dom";

export default function UserProfile() {
  const { username } = useParams();
  if (!username)
    throw new Error("username not found");

  return (
    <div>
      User Profile : {username}
    </div>
  );
}

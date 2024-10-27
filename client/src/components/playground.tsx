import { useParams } from "react-router-dom";

export default function Playground() {
  const { did } = useParams();
  if (!did)
    console.log("Deck ID not found");

  return (
    <div>
      Playground : {did}
    </div>
  );
}

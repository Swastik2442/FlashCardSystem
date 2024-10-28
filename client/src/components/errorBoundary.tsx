import { useRouteError } from "react-router-dom";

export default function ErrorBoundary() {
  const err = useRouteError();
  console.error(err);
  return (
    <div>
      An Error occured while rendering this page.
      {err instanceof Error && <><br/><span>{err.message}</span></>}
    </div>
  );
}

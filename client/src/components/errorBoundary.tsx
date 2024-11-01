import { useRouteError } from "react-router-dom";

/**
 * A Component to display the Error Message when an Error occurs while rendering a Page.
 */
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

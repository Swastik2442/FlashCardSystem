import { JSX } from "react";
import { useLoaderData, useNavigate, LoaderFunctionArgs } from "react-router-dom";
import { useAuth } from "@/contexts/authProvider";
import { Button } from "@/components/ui/button";
import { UserOptions, UserOptionsLoader } from "./userOptions";
import { AccountOptions, AccountOptionsLoader } from "./accountOptions";
import { SecurityOptions } from "./securityOptions";

export async function SettingsLoader({ params }: LoaderFunctionArgs) {
  let name = params.name, Component, data;

  switch (name) {
    case "user":
      Component = UserOptions;
      data = await UserOptionsLoader();
      break;
    case "account":
      Component = AccountOptions;
      data = await AccountOptionsLoader();
      break;
    case "security":
      Component = SecurityOptions;
      break;
    default:
      name = "user";
      Component = UserOptions;
      data = await UserOptionsLoader();
      break;
  }

  name = name.replace(/\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
  return {name, Component, data};
}

export function Settings() {
  const { name, Component, data } = useLoaderData() as { name: string, Component: ({ data }: { data?: unknown }) => JSX.Element, data: unknown };
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="my-4">
      <div className="flex justify-between ml-10 mr-4">
        <h1 className="text-lg select-none">{name} Settings</h1>
        <Button onClick={() => navigate(`/users/${user}`)} type="button" title="Profile" variant="outline" size="sm">Your Profile</Button>
      </div>
      <hr className="my-4" />
      <div className="mx-8">
        <Component data={data} />
      </div>
    </div>
  );
}

export default Settings;

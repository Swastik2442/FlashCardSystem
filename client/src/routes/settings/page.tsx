import { JSX } from "react";
import { useLoaderData, Link, LoaderFunctionArgs } from "react-router-dom";
import { SettingsIcon, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/contexts/authProvider";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserOptions, UserOptionsLoader } from "./userOptions";
import { AccountOptions, AccountOptionsLoader } from "./accountOptions";
import { SecurityOptions } from "./securityOptions";
import { useMediaQuery } from "@/hooks/mediaQuery";

const settingsOptions = [
  {
    label: null,
    items: [
      {
        title: "Profile",
        url: "/settings/user",
        icon: User,
      },
      {
        title: "Account",
        url: "/settings/account",
        icon: SettingsIcon,
      },
    ]
  },
  {
    label: "Access",
    items: [
      {
        title: "Authentication",
        url: "/settings/security",
        icon: ShieldCheck,
      },
    ]
  },
] as const;

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
  const { name, Component, data } = useLoaderData() as {
    name: string,
    Component: ({ data }: { data?: unknown }) => JSX.Element,
    data: unknown
  };
  const { user } = useAuth();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <div className="my-4">
      <SidebarProvider>
        <SettingsSidebar collapsible={!isDesktop} />
        <div className="h-full w-full">
          <div className="flex justify-between mr-4 ml-2 md:ml-4">
            <div className="flex gap-1 items-center">
              {!isDesktop && <SidebarTrigger />}
              <h1 className="text-lg select-none">{name} Settings</h1>
            </div>
            <Link to={`/users/${user}`}>
              <Button type="button" title="Profile" variant="outline" size="sm">
                Your Profile
              </Button>
            </Link>
          </div>
          <hr className="my-4" />
          <div className="mx-4">
            <Component data={data} />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}

function SettingsSidebar({ collapsible }: { collapsible: boolean }) {
  return (
    <Sidebar collapsible={collapsible ? "offcanvas" : "none"}>
      <SidebarContent>
        {settingsOptions.map((group) => (
          <SidebarGroup>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} preventScrollReset={true}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export default Settings;

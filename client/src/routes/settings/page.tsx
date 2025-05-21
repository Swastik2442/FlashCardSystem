import { JSX } from "react"
import {
  useLoaderData,
  Link,
  LoaderFunctionArgs
} from "react-router-dom"
import {
  ListTodo,
  SettingsIcon,
  ShieldCheck,
  User
} from "lucide-react"
import { useAuth } from "@/contexts/authProvider"
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { UserOptions } from "./options/user"
import { AccountOptions } from "./options/account"
import { SecurityOptions } from "./options/security"
import { FeaturesOptions } from "./options/features"
import { useMediaQuery } from "@/hooks/mediaQuery"

interface ISettingsData {
  name: string,
  Component: () => JSX.Element,
}

const settingsOptions = [
  {
    label: null,
    items: [
      {
        title: "Profile",
        url: "/user",
        icon: User,
        Component: UserOptions
      },
      {
        title: "Account",
        url: "/account",
        icon: SettingsIcon,
        Component: AccountOptions
      },
    ]
  },
  {
    label: "Access",
    items: [
      {
        title: "Authentication",
        url: "/security",
        icon: ShieldCheck,
        Component: SecurityOptions
      },
      {
        title: "Features",
        url: "/features",
        icon: ListTodo,
        Component: FeaturesOptions
      },
    ]
  },
] as const

export function SettingsLoader({ params }: LoaderFunctionArgs) {
  let name = params.name, Component
  name ??= "user"

  for (const group of settingsOptions) {
    for (const item of group.items) {
      if (item.url.endsWith(`/${name}`)) {
        Component = item.Component
        break
      }
    }
    if (Component) break
  }
  if (!Component) {
    name = "user"
    Component = UserOptions
  }

  // Convert to Sentence Case
  name = name.replace(/\w\S*/g,
    text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  )
  return { name, Component }
}

export function Settings() {
  const { name, Component } = useLoaderData<ISettingsData>()
  const { user } = useAuth()
  const isDesktop = useMediaQuery("(min-width: 768px)")

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
            <Component />
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}

function SettingsSidebar({ collapsible }: { collapsible: boolean }) {
  return (
    <Sidebar collapsible={collapsible ? "offcanvas" : "none"}>
      <SidebarContent>
        {settingsOptions.map((group, groupID) => (
          <SidebarGroup key={groupID}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={"/settings" + item.url} preventScrollReset={true}>
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
  )
}

export default Settings

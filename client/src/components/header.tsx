import { Diamond } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { GitHubLogo } from "./icons";
import { ThemeToggle } from "./themeToggle";
import { OptionsMenu } from "./optionsMenu";

const navLinkClasses = ({ isActive }: { isActive: boolean }) => (
  [
    "transition-colors hover:text-foreground/80",
    isActive ? "text-foreground" : "text-foreground/60",
  ].join(" ")
);

export default function Header() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <a className="mr-4 flex items-center space-x-2 lg:mr-6 hover:cursor-pointer" onClick={() => navigate(0)}>
            <Diamond className="size-4" />
            <span className="font-bold hidden sm:inline-block">{import.meta.env.VITE_APP_TITLE || "FlashCardSystem"}</span>
          </a>
          <nav className="hidden sm:flex items-center gap-4 text-sm lg:gap-6">
            <NavLink to="/dashboard" className={navLinkClasses}>Dashboard</NavLink>
            <NavLink to="/play" className={navLinkClasses}>Play</NavLink>
          </nav>
        </div>
        <div className="flex flex-1 items-center space-x-2 justify-end">
          <nav className="flex items-center gap-1">
            <a target="_blank" rel="noreferrer" href="https://github.com/Swastik2442/FlashCardSystem">
              <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground py-2 h-8 w-8 px-0">
                <GitHubLogo className="size-5" />
                <span className="sr-only select-none">GitHub</span>
              </div>
            </a>
            <ThemeToggle />
            <OptionsMenu />
          </nav>
        </div>
      </div>
    </header>
  );
}

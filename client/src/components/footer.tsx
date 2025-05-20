import { Link } from "react-router-dom";
import { ReactLogo, ExpressLogo, MongoDBLogo } from "./icons";

const tech = [
  {
    name: "React",
    icon: ReactLogo,
    url: "https://react.dev"
  },
  {
    name: "Express",
    icon: ExpressLogo,
    url: "https://expressjs.com"
  },
  {
    name: "MongoDB",
    icon: MongoDBLogo,
    url: "https://www.mongodb.com"
  },
];

/**
 * A Footer Component with Ownership and Tech Stack Information.
 */
export default function Footer() {
  return (
    <footer className="w-full px-4">
      <hr className="w-3/4 mx-auto" />
      <div className="flex items-center h-14">
        <p>
          &copy; <Link to="https://swastik2442.vercel.app">Swastik Kulshreshtha</Link>
          <span className="hidden sm:inline-block">
            , Sourabh Yadav &amp; Saurabh Saini
          </span>
        </p>
        <nav className="flex flex-1 items-center gap-2 justify-end">
          <span className="text-foreground/40">Made with</span>
          {tech.map((item, idx) => (
            <a href={item.url} target="_blank" key={idx}>
              <item.icon className="size-6 hover:fill-foreground/40" />
              <span className="sr-only">{item.name}</span>
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

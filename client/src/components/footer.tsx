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

export default function Footer() {
  return (
    <footer className="w-full px-4">
      <hr className="w-3/4 mx-auto" />
      <div className="flex items-center h-14">
        <p>&copy; Swastik Kulshreshtha<span className="hidden sm:inline-block">, Sourabh Yadav &amp; Saurabh Saini</span></p>
        <nav className="flex flex-1 items-center gap-2 justify-end">
          {tech.map((item) => (
            <a href={item.url} target="_blank">
              <item.icon className="w-6 h-6" />
              <span className="sr-only">{item.name}</span>
            </a>  
          ))}
        </nav>
      </div>
    </footer>
  );
}

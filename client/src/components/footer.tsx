import { ReactLogo, MongoDBLogo } from "./icons";

export default function Footer() {
  return (
    <div>
      Footer
      <a href="https://react.dev" target="_blank">
        <ReactLogo className="w-6 h-6" />
      </a>
      <a href="https://www.mongodb.com" target="_blank">
        <MongoDBLogo className="w-6 h-6" />
      </a>
    </div>
  )
}

import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="text-blue-500">
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-blue-500">FlashCardSystem</h1>
      <button onClick={() => setCount((count) => count + 1)} className="border-2 rounded p-3" >
        count is {count}
      </button>
    </>
  )
}

export default App

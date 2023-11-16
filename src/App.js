import { useEffect, useMemo, useState } from "react";
import "./App.css";
import router from "./routes";
import { RouterProvider } from "react-router-dom";

import { StateContext } from "./context";

function App() {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || "");
  const [skillLevel, setSkillLevel] = useState(
    localStorage.getItem("skillLevel") || ""
  );

  const ctxt = useMemo(
    () => ({
      userId,
      setUserId,
      skillLevel,
      setSkillLevel,
    }),
    [skillLevel, userId]
  );
  return (
    <div className="App">
      <StateContext.Provider value={ctxt}>
        <RouterProvider router={router} />
      </StateContext.Provider>
    </div>
  );
}

export default App;

import { createBrowserRouter } from "react-router-dom";
import Interface from "./Interface";
import Login from "./Login";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/app",
    element: <Interface />,
  },
]);

export default router;

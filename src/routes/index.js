import { createBrowserRouter } from "react-router-dom";
import Interface from "./Interface";
import Login from "./Login";
import End from "./End";
import Error from "./Error";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
    errorElement: <Error />,
  },
  {
    path: "/app",
    element: <Interface />,
  },
  {
    path: "/end",
    element: <End />,
  },
]);

export default router;

import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Welcome from "../components/Welcome";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import LandingPage from "../pages/Landingpage";
import HistoryPage from "../pages/History";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Welcome />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "landingpage",
        element: <LandingPage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
    ],
  },
]);

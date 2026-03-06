import { createBrowserRouter, Navigate } from "react-router-dom";

import { loginAction, LoginPage } from "./pages/login";
import { homeAction, homeLoader, HomePage } from "./pages/home";
import { rootLoader } from "./pages/root";
import { isAuthenticated } from "./auth";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      loader: rootLoader,
      children: [
        { index: true, element: <Navigate to={isAuthenticated() ? "/home" : "/login"} replace /> },
        {
          path: "login",
          element: <LoginPage />,
          action: loginAction,
        },
        {
          path: "home",
          element: <HomePage />,
          loader: homeLoader,
          action: homeAction,
        },
      ],
    },
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

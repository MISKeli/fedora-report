import { Navigate } from "react-router-dom";
import LoginPage from "./LoginPage";

export const LoginRoute = () => {
  const token = sessionStorage.getItem("apiKey");

  // If user has token, redirect to home
  // If no token, show login page
  return token ? <Navigate to="/" replace /> : <LoginPage />;
};

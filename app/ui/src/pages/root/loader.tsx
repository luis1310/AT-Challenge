import { LoaderFunctionArgs, redirect } from "react-router-dom";
import { isAuthenticated } from "../../auth";

export function rootLoader({ request }: LoaderFunctionArgs) {
  const authenticated = isAuthenticated();
  const pathname = new URL(request.url).pathname;
  const redirectTo = authenticated ? "/home" : "/login";

  if (pathname === redirectTo) {
    return null;
  }

  return authenticated ? null : redirect(redirectTo);
}

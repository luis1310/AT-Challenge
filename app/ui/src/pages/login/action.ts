import { ActionFunctionArgs, redirect } from "react-router-dom";
import { URL_API } from "../../constants";
import { setToken } from "../../auth";

export async function loginAction({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return null;

  const formData = await request.formData();
  const username = (formData.get("username") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";

  if (!username || !password) {
    return { ok: false, message: "Username and password are required." };
  }

  try {
    const res = await fetch(`${URL_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { ok: false, message: data.message ?? "Login failed." };
    }

    const token = data.token;
    if (!token) {
      return { ok: false, message: "Invalid response from server." };
    }

    setToken(token);
    return redirect("/home");
  } catch {
    return { ok: false, message: "Network error. Try again." };
  }
}

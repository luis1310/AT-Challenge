import { ActionFunctionArgs, redirect } from "react-router-dom";
import { apiPost, ApiError } from "../../api";

export async function homeAction({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") return null;

  const formData = await request.formData();
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() ?? "";
  const username = (formData.get("username") as string)?.trim();
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";
  const referredByIdRaw = formData.get("referredById") as string | null;

  if (!firstName || !lastName || !username || !password) {
    return { ok: false, message: "First name, last name, username and password are required." };
  }

  if (password !== confirmPassword) {
    return { ok: false, message: "Password and Confirm Password must match." };
  }

  if (password.length < 4) {
    return { ok: false, message: "Password must be at least 4 characters." };
  }

  try {
    await apiPost("agents", {
      firstName,
      lastName,
      phone: phone || undefined,
      username,
      password,
      referredById: referredByIdRaw ? parseInt(referredByIdRaw, 10) : undefined,
    });
    return redirect("/home");
  } catch (e) {
    if (e instanceof ApiError) {
      return { ok: false, message: e.message };
    }
    return { ok: false, message: "Could not create agent. Try again." };
  }
}

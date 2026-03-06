import { redirect } from "react-router-dom";
import { apiGet, ApiError } from "../../api";
import type { AgentTreeNode } from "../../models";

export async function homeLoader(): Promise<AgentTreeNode[]> {
  try {
    const tree = await apiGet<AgentTreeNode[]>("/agents");
    return tree;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      throw redirect("/login");
    }
    console.error("homeLoader: no se pudo cargar agentes", e);
    return [];
  }
}

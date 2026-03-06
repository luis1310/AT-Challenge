export type AgentReferral = {
  id: number;
  fullName: string;
  username: string;
  phone: string;
  status: string;
  referredById?: number | null;
  /** Nested referrals for tree view */
  referrals?: AgentReferral[];
  /** Nivel de anidación para indentación en tabla (0 = raíz) */
  depth?: number;
};

/** Respuesta del API GET /api/agents (árbol) */
export type AgentTreeNode = {
  id: number;
  fullName: string;
  username: string;
  phone: string;
  status: string;
  referredById?: number | null;
  referrals: AgentTreeNode[];
};
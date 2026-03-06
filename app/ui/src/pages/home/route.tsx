import { useState } from "react";
import { Button } from "@nextui-org/react";
import { NavBar, Page } from "../../components";
import { ReferralTable } from "./referral-table";
import { AddReferralModal } from "./add_referral_modal";
import { ViewAgentModal } from "./view_agent_modal";
import { useActionData, useLoaderData, useNavigate, useRevalidator } from "react-router-dom";
import type { AgentTreeNode } from "../../models";
import { removeToken } from "../../auth";
import { apiDelete, ApiError } from "../../api";

export function HomePage() {
  const tree = useLoaderData() as AgentTreeNode[];
  const actionData = useActionData() as { ok?: boolean; message?: string } | undefined;
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalReferred, setAddModalReferred] = useState<{ id: number; name: string } | null>(null);
  const [viewAgent, setViewAgent] = useState<AgentTreeNode | null>(null);

  const handleLogout = () => {
    removeToken();
    navigate("/login", { replace: true });
  };

  const openAddModal = (referred?: { id: number; name: string }) => {
    setAddModalReferred(referred ?? null);
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setAddModalReferred(null);
  };

  return (
    <Page className="p-8">
      <NavBar onLogout={handleLogout} />

      <div className="flex justify-end">
        <AddReferralModal
          isOpen={addModalOpen}
          onOpenChange={(open) => { if (!open) closeAddModal(); else setAddModalOpen(true); }}
          errorMessage={actionData && !actionData.ok ? actionData.message : null}
          referredById={addModalReferred?.id ?? undefined}
          referredByName={addModalReferred?.name}
        />
        <Button color="primary" onPress={() => openAddModal()}>
          Add
        </Button>
      </div>

      <div className="grow">
        <ReferralTable
          tree={tree}
          onView={setViewAgent}
          onAddReferral={(node) => openAddModal({ id: node.id, name: node.fullName })}
          onDelete={async (node) => {
            if (!window.confirm(`Remove "${node.fullName}" (${node.username}) from the list? Their referrals will still appear (soft delete).`)) return;
            try {
              await apiDelete(`agents/${node.id}`);
              revalidator.revalidate();
            } catch (e) {
              alert(e instanceof ApiError ? e.message : "Could not delete.");
            }
          }}
        />
      </div>

      {viewAgent && (
        <ViewAgentModal
          agent={viewAgent}
          onClose={() => setViewAgent(null)}
        />
      )}
    </Page>
  );
}

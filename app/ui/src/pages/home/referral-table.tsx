import { Fragment } from "react";
import { Button } from "@nextui-org/react";
import { AddUserIcon, DeleteIcon, EyeIcon, ReactivateIcon } from "../../components";
import type { AgentTreeNode } from "../../models";

interface ReferralTableProps {
  tree: AgentTreeNode[];
  onView?: (node: AgentTreeNode) => void;
  onAddReferral?: (node: AgentTreeNode) => void;
  onDelete?: (node: AgentTreeNode) => void;
  onReactivate?: (node: AgentTreeNode) => void;
}

export function ReferralTable({ tree, onView, onAddReferral, onDelete, onReactivate }: ReferralTableProps) {
  if (!tree.length) {
    return (
      <div className="rounded-lg border border-default-200 bg-default-50 p-8 text-center text-default-500">
        No hay agentes. Usa &quot;Add&quot; para agregar uno.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-default-200 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-default-100 border-b border-default-200">
          <tr>
            <th className="px-4 py-3 font-semibold">NAMES</th>
            <th className="px-4 py-3 font-semibold">USERNAME</th>
            <th className="px-4 py-3 font-semibold">PHONE</th>
            <th className="px-4 py-3 font-semibold">STATUS</th>
            <th className="px-4 py-3 font-semibold">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-default-100">
          {tree.map((node) => (
            <Fragment key={node.id}>
              <tr className="bg-default-50/50 hover:bg-default-100/50">
                <td className="px-4 py-3">{node.fullName}</td>
                <td className="px-4 py-3">{node.username}</td>
                <td className="px-4 py-3">{node.phone}</td>
                <td className="px-4 py-3">{node.status}</td>
                <td className="px-4 py-3">
                  <ActionButtons node={node} onView={onView} onAddReferral={onAddReferral} onDelete={onDelete} />
                </td>
              </tr>
              {node.referrals && node.referrals.length > 0 && (
                <tr key={`ref-${node.id}`}>
                  <td colSpan={5} className="p-0 bg-default-50">
                    <div className="border-l-4 border-primary-300 ml-4 my-2 rounded-r-md bg-default-100/80">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-default-200">
                            <th className="px-4 py-2 font-medium text-default-600">NAMES</th>
                            <th className="px-4 py-2 font-medium text-default-600">USERNAME</th>
                            <th className="px-4 py-2 font-medium text-default-600">PHONE</th>
                            <th className="px-4 py-2 font-medium text-default-600">STATUS</th>
                            <th className="px-4 py-2 font-medium text-default-600">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-default-100">
                          {node.referrals.map((ref) => (
                            <tr key={ref.id} className="hover:bg-default-200/50">
                              <td className="px-4 py-2">{ref.fullName}</td>
                              <td className="px-4 py-2">{ref.username}</td>
                              <td className="px-4 py-2">{ref.phone}</td>
                              <td className="px-4 py-2">{ref.status}</td>
                              <td className="px-4 py-2">
                                <ActionButtons node={ref} onView={onView} onAddReferral={onAddReferral} onDelete={onDelete} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ActionButtonsProps {
  node: AgentTreeNode;
  onView?: (node: AgentTreeNode) => void;
  onAddReferral?: (node: AgentTreeNode) => void;
  onDelete?: (node: AgentTreeNode) => void;
}

function ActionButtons({ node, onView, onAddReferral, onDelete }: ActionButtonsProps) {
  return (
    <>
      <Button
        className="mr-2"
        variant="flat"
        size="sm"
        isIconOnly
        onPress={() => onView?.(node)}
        aria-label="View agent"
      >
        <EyeIcon />
      </Button>
      <Button
        className="mr-2"
        variant="flat"
        size="sm"
        isIconOnly
        onPress={() => onAddReferral?.(node)}
        aria-label="Add referral"
      >
        <AddUserIcon />
      </Button>
      <Button
        variant="flat"
        size="sm"
        isIconOnly
        onPress={() => onDelete?.(node)}
        aria-label="Delete agent"
      >
        <DeleteIcon />
      </Button>
    </>
  );
}

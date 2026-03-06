import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react";
import type { AgentTreeNode } from "../../models";

interface ViewAgentModalProps {
  agent: AgentTreeNode;
  onClose: () => void;
}

export function ViewAgentModal({ agent, onClose }: ViewAgentModalProps) {
  return (
    <Modal isOpen={true} onOpenChange={(open) => { if (!open) onClose(); }} placement="top-center">
      <ModalContent>
        <ModalHeader className="flex justify-center">
          Agent details
        </ModalHeader>
        <ModalBody>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium text-default-500">Name</dt>
            <dd>{agent.fullName}</dd>
            <dt className="font-medium text-default-500">Username</dt>
            <dd>{agent.username}</dd>
            <dt className="font-medium text-default-500">Phone</dt>
            <dd>{agent.phone || "—"}</dd>
            <dt className="font-medium text-default-500">Status</dt>
            <dd className="capitalize">{agent.status}</dd>
            <dt className="font-medium text-default-500">Referred by ID</dt>
            <dd>{agent.referredById ?? "—"}</dd>
          </dl>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" variant="flat" onPress={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

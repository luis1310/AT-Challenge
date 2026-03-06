import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { Form } from "react-router-dom";

interface AddReferralModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage?: string | null;
  referredById?: number;
  referredByName?: string;
}

export function AddReferralModal({
  isOpen,
  onOpenChange,
  errorMessage,
  referredById,
  referredByName,
}: AddReferralModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent as={Form} method="POST">
        {(onClose) => (
          <>
            <ModalHeader className="flex justify-center">
              {referredByName ? `New referral under ${referredByName}` : "New Agent"}
            </ModalHeader>
            <ModalBody>
              {errorMessage && (
                <p className="text-danger text-sm mb-2" role="alert">
                  {errorMessage}
                </p>
              )}
              {referredById != null && (
                <input type="hidden" name="referredById" value={String(referredById)} readOnly />
              )}
              <fieldset className="flex flex-col gap-4">
                <legend className="font-semibold mb-4">Personal Information</legend>
                <div className="flex gap-4">
                  <Input name="firstName" label="First name" required />
                  <Input name="lastName" label="Last name" required />
                </div>
                <Input name="phone" label="Phone" required />
              </fieldset>
              <fieldset className="flex flex-col gap-4">
                <legend className="font-semibold mb-4">Access Details</legend>
                <Input name="username" label="Username" required />
                <div className="flex gap-4">
                  <Input name="password" label="Password" type="password" required />
                  <Input name="confirmPassword" label="Confirm Password" type="password" required />
                </div>
              </fieldset>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" type="submit">
                Save
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

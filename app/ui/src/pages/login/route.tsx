import { Form, useActionData } from "react-router-dom";
import { ApiStatus, Page } from "../../components";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Image,
  Input,
  Spacer,
} from "@nextui-org/react";

export function LoginPage() {
  const actionData = useActionData() as { ok?: boolean; message?: string } | undefined;
  const errorMessage = actionData && !actionData.ok ? actionData.message : null;

  return (
    <Page className="justify-center items-center">
      <Card as={Form} className="w-1/2 lg:w-1/3" method="POST">
        <CardHeader className="flex-col justify-center gap-4">
          <Image src="/brand.png" width={140} />
          <h1 className="font-bold m-auto">AGENT REFERRAL SYSTEM</h1>
          <ApiStatus />
        </CardHeader>
        <CardBody>
          {errorMessage && (
            <p className="text-danger text-sm mb-2" role="alert">
              {errorMessage}
            </p>
          )}
          <Input name="username" type="text" label="Username" required autoComplete="username" />
          <Spacer y={4} />
          <Input name="password" type="password" label="Password" required autoComplete="current-password" />
        </CardBody>
        <CardFooter className="justify-center">
          <Button type="submit">Login</Button>
        </CardFooter>
      </Card>
    </Page>
  );
}

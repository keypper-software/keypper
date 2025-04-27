import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/interface/button";
import Card from "~/components/interface/card";
import { Input } from "~/components/interface/input";
import { APP_NAME } from "~/lib/constants";
export const Route = createFileRoute("/(auth)/auth/cli/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "CLI Authentication",
      },
    ],
  }),
});

function RouteComponent() {
  const [authPhrase, setAuthPhrase] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [isAuthPhraseValid, setIsAuthPhraseValid] = useState(false);

  const {
    mutate: verifyAuthPhraseMutation,
    isPending: isVerifyAuthPhrasePending,
    data: authPhraseData,
  } = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/cli/auth-phrase?auth_phrase=${authPhrase}`
      );
      return response.json();
    },
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error);
      } else {
        setIsAuthPhraseValid(true);
        setAuthPhrase("");
        setTokenName(data.machineName);
      }
    },
  });

  const verifyAuthPhrase = async () => {
    verifyAuthPhraseMutation();
  };

  const navigate = useNavigate();

  const completeAuth = async () => {
    setIsAuthPhraseValid(true);
    setAuthPhrase("");
    navigate({ to: "/auth/cli/complete" });
  };

  return (
    <div className="p-10 flex items-center flex-col">
      <img src="/logo/wordmark.png" alt="logo" className="w-48" />
      <h1 className="text-5xl font-medium text-center mt-10">
        CLI Authentication
      </h1>

      <Card className="mt-10 max-w-screen-sm w-full">
        <p className="text-lg font-medium">
          {isAuthPhraseValid ? "Enter token name" : "Enter auth phrase"}
        </p>

        {!isAuthPhraseValid && (
          <p className="text-sm text-gray-500">
            Auth phrase has been copied to your clipboard by{" "}
            <span className="lowercase font-mono bg-accent/15 p-1 text-accent rounded-sm">
              $ {APP_NAME} login
            </span>{" "}
            paste it below.
          </p>
        )}

        {isAuthPhraseValid && (
          <p className="text-sm text-gray-500 mt-4">
            Enter a name for this token, eg.{" "}
            <span className="font-mono font-semibold">
              {authPhraseData?.userName}'s laptop.
            </span>{" "}
            This will help you identify it later if you need to revoke it.
          </p>
        )}

        <Input
          value={isAuthPhraseValid ? tokenName : authPhrase}
          onChange={(e) =>
            isAuthPhraseValid
              ? setTokenName(e.target.value)
              : setAuthPhrase(e.target.value)
          }
          className="mt-4"
          placeholder={isAuthPhraseValid ? "Token name" : "Auth phrase"}
        />
        <Button
          className="w-full mt-4"
          disabled={isAuthPhraseValid ? !tokenName : !authPhrase}
          onClick={isAuthPhraseValid ? completeAuth : verifyAuthPhrase}
          isLoading={isVerifyAuthPhrasePending}
        >
          {isAuthPhraseValid ? "Complete CLI Auth" : "Continue"}
        </Button>
      </Card>

      <p></p>
    </div>
  );
}

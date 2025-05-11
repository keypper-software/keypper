"use client"
import { Button } from "@/components/interface/button";
import Card from "@/components/interface/card";
import { Input } from "@/components/interface/input";
import { APP_NAME } from "@/constants";
import api from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function Page() {
  const looseSearch = useSearchParams();
  const phrase = looseSearch.get("phrase");
  const [authPhrase, setAuthPhrase] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [isAuthPhraseValid, setIsAuthPhraseValid] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (phrase) {
      const regexp = /^([a-z]+)(-[a-z]+){4,}$/;
      const valid = phrase?.match?.(regexp);
      valid && setAuthPhrase(phrase);

      router.replace(pathname);
    }
  }, [looseSearch]);

  const {
    mutate: verifyAuthPhraseMutation,
    isPending: isVerifyAuthPhrasePending,
    data: authPhraseData,
  } = useMutation({
    mutationFn: async () => {
      const { data } = await api.get(
        `/cli/auth-phrase?auth_phrase=${authPhrase}`
      );
      return data;
    },
    onSuccess: (data) => {
      setIsAuthPhraseValid(true);
      setAuthPhrase("");
      setTokenName(data.machineName);
    },
    onError: (error) => {
      // @ts-ignore
      toast.error(error.response.data.error);
    },
  });

  const verifyAuthPhrase = async () => {
    verifyAuthPhraseMutation();
  };

  const {
    mutate: createTokenMutation,
    isPending: isCreateTokenPending,
    data: createTokenData,
  } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/cli/token`, {
        authPhraseId: authPhraseData?.id,
        name: tokenName,
        machineName: authPhraseData?.machineName,
        operatingSystem: authPhraseData?.operatingSystem,
      });
      return data;
    },
    onSuccess: () => {
      setIsAuthPhraseValid(true);
      setAuthPhrase("");
      router.replace("/auth/cli/complete");
    },
    onError: (error) => {
      // @ts-ignore
      toast.error(error.response.data.error);
    },
  });

  const createToken = async () => {
    createTokenMutation();
  };

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center flex-col">
      <img src="/logo/wordmark.png" alt="logo" className="w-48" />
      <h1 className="text-5xl font-medium text-center mt-10">
        CLI Authentication
      </h1>

      <Card className="mt-10 border-white/5 max-w-screen-sm w-full">
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
          onClick={isAuthPhraseValid ? createToken : verifyAuthPhrase}
          isLoading={isVerifyAuthPhrasePending || isCreateTokenPending}
        >
          {isAuthPhraseValid ? "Complete CLI Auth" : "Continue"}
        </Button>
      </Card>

      <p></p>
    </div>
  );
}

export default Page;

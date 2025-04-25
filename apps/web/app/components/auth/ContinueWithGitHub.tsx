import { authClient } from "~/lib/auth-client";
import { SiGithub } from "react-icons/si";
import { Button } from "~/components/interface/button";
import { useState } from "react";
const ContinueWithGitHub = () => {
  const signIn = async () => {
    setIsLoading(true);
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/bllow/projects",
      newUserCallbackURL: "/onboarding",
    });
  };
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      className="flex items-start gap-x-2 px-10 py-3 text-base bg-black text-foreground hover:text-black transition-colors"
      onClick={signIn}
      isLoading={isLoading}
    >
      <SiGithub size={20} /> Continue with GitHub
    </Button>
  );
};

export default ContinueWithGitHub;

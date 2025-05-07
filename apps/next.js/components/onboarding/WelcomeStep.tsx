import { APP_NAME } from "@/lib/constants";

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <>
      <h1 className="text-6xl font-bold text-center">Welcome to {APP_NAME}</h1>
      <p className="text-xl text-muted-foreground text-center">
        {APP_NAME} is THE secret management tool for mordern engineering teams.
      </p>
    </>
  );
}

import { Loader2 } from "lucide-react";
import Secret from "@/components/workspace/projects/secret";
import { RevealedSecret } from "@/stores/secrets";

interface SecretsListProps {
  secrets: RevealedSecret[];
  isLoading: boolean;
}

export default function SecretsList({ secrets, isLoading }: SecretsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7 secrets-list">
      {
        secrets.length ==0&&(
          <div className="p-12 text-sm">
            <div className="text-center">No secrets</div>
          </div>
        )
      }
      {secrets.map((secret, index) => (
        <div className="">
          <Secret key={index} secret={secret} />
        </div>
      ))}
    </div>
  );
}

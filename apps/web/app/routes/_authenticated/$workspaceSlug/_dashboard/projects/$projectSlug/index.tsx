import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useSecrets } from "~/hooks/useSecrets";
import AddSecretsDialog from "~/components/workspace/projects/modals/add-secrets";
import SecretsList from "~/components/workspace/projects/secrets-list";
import useEnvironmentStore from "~/stores/environment";
import { useEffect, useState } from "react";
import useEnvironments from "~/hooks/useEnvironments";
import { Button } from "~/components/interface/button";
import api from "~/api";
import axios from "axios";
import { toast } from "sonner";
import useSecretsStore from "~/stores/secrets";

export const Route = createFileRoute(
  "/_authenticated/$workspaceSlug/_dashboard/projects/$projectSlug/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug, projectSlug } = Route.useParams();

  const {
    environments,
    loading: environmentsLoading,
    initialEnv,
  } = useEnvironments({
    projectSlug,
    workspaceSlug,
  });
  const {
    secrets,
    secretsLoading,
    getChangesCount,
    mutate,
    saveChanges,
    fetchSecrets,
    mutateAsync,
  } = useSecrets(workspaceSlug, projectSlug);

  const { setSecrets } = useSecretsStore();

  const { environment, setEnvironment } = useEnvironmentStore(); // use this to only get env if sure it has been loaded
  // set first env
  useEffect(() => {
    setEnvironment(initialEnv);
  }, [initialEnv]);

  useEffect(() => {
    environment && mutate();
  }, [environment]);

  const noOfChanges = getChangesCount();
  const [saveChangesLoading, setSaveChangesLoading] = useState(false);

  const handleSaveChanges = async () => {
    try {
      setSaveChangesLoading(true);
      const changes = saveChanges();

      await axios.put(`/api/${workspaceSlug}/${projectSlug}/secrets`, {
        secrets: changes,
      });

      toast.success("Changes saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes");
    } finally {
      setSaveChangesLoading(false);
    }
  };

  if (environmentsLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-x-6">
          <Select
            onValueChange={(value) => {
              setEnvironment(value);
            }}
            value={environment}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue defaultValue={environment} />
            </SelectTrigger>
            <SelectContent>
              {environments?.environments?.map((environment) => (
                <SelectItem value={environment.name}>
                  {environment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {secrets?.length > 0 && (
            <p className="text-sm">{secrets?.length} secrets</p>
          )}
        </div>

        <div className="flex items-center gap-x-2">
          {noOfChanges > 0 && (
            <span className="text-sm text-yellow-500">
              {noOfChanges} unsaved changes
            </span>
          )}

          <Button
            disabled={!noOfChanges}
            onClick={handleSaveChanges}
            isLoading={saveChangesLoading}
          >
            Save Changes
          </Button>
          <AddSecretsDialog
            workspaceSlug={workspaceSlug}
            projectSlug={projectSlug}
            selectedEnvironment={environment}
          />
        </div>
      </div>

      <SecretsList secrets={secrets} isLoading={secretsLoading} />
    </div>
  );
}

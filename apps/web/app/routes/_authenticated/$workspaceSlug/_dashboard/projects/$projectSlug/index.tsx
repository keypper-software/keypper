import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { Button } from "~/components/interface/button";
import useSecretsStore from "~/stores/secrets";
import { useUnsavedChangesStore } from "~/stores/unsaved-changes";

export const Route = createFileRoute(
  "/_authenticated/$workspaceSlug/_dashboard/projects/$projectSlug/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug, projectSlug } = Route.useParams();

  const {
    selectedEnvironment,
    setSelectedEnvironment,
    environmentsData,
    environmentsLoading,
    secretsData,
    secretsLoading,
    localSecrets,
    setLocalSecrets,
  } = useSecrets(workspaceSlug, projectSlug);

  const { setEnvironment } = useEnvironmentStore();
  const { unsavedChanges: numberOfUnsavedChanges } = useUnsavedChangesStore();

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
              setLocalSecrets([]);
              setEnvironment(value);
              setSelectedEnvironment(value);
            }}
            value={selectedEnvironment}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue defaultValue={selectedEnvironment} />
            </SelectTrigger>
            <SelectContent>
              {environmentsData?.environments?.map((environment) => (
                <SelectItem value={environment.name}>
                  {environment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {secretsData?.count > 0 && (
            <p className="text-sm">{secretsData?.count} secrets</p>
          )}
        </div>

        <div className="flex items-center gap-x-2">
          {numberOfUnsavedChanges > 0 && (
            <span className="text-sm text-yellow-500">
              {numberOfUnsavedChanges} unsaved changes
            </span>
          )}
          <Button disabled={numberOfUnsavedChanges === 0}>Save</Button>
          <AddSecretsDialog
            workspaceSlug={workspaceSlug}
            projectSlug={projectSlug}
            selectedEnvironment={selectedEnvironment}
          />
        </div>
      </div>

      <SecretsList secrets={localSecrets} isLoading={secretsLoading} />
    </div>
  );
}

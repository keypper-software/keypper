"use client";
import { Button } from "@/components/interface/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddSecretsDialog from "@/components/workspace/projects/modals/add-secrets";
import SecretsList from "@/components/workspace/projects/secrets-list";
import { useUser } from "@/context/user-context";
import { useSecrets } from "@/hooks/useSecrets";
import useEnvironmentStore from "@/stores/environment";
import React, { useEffect } from "react";

const Page = () => {
  const { currentWorkspace, projectSlug } = useUser();
  const { environment, environments, setEnvironment } = useEnvironmentStore();
  const { secrets, secretsLoading, mutate, getChangesCount } = useSecrets(
    currentWorkspace.name,
    projectSlug!
  );
  useEffect(() => {
    mutate();
  }, [environment]);

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-x-6">
          <Select
            onValueChange={(value) => {
              setEnvironment(value);
            }}
            value={environment}
          >
            <SelectTrigger className="w-[180px] border-white/10">
              <SelectValue defaultValue={environment} />
            </SelectTrigger>
            <SelectContent className="border-white/10">
              {environments?.map((environment) => (
                <SelectItem key={environment.id} value={environment.name}>
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
          {getChangesCount() > 0 && (
            <span className="text-sm text-yellow-500">
              {getChangesCount()} unsaved changes
            </span>
          )}

          <div className="flex gap-3">
            <Button
            // disabled={!noOfChanges}
            // onClick={handleSaveChanges}
            // isLoading={saveChangesLoading}
            >
              Save Changes
            </Button>
          </div>
          <AddSecretsDialog selectedEnvironment={environment} />
        </div>
      </div>

      <SecretsList secrets={secrets} isLoading={secretsLoading} />
    </div>
  );
};

export default Page;

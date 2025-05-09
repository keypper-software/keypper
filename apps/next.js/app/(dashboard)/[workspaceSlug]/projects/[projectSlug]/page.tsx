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
import { environment } from "@/db/schema";
import useEnvironments from "@/hooks/useEnvironments";
import { useSecrets } from "@/hooks/useSecrets";
import React, { useEffect, useState } from "react";

const Page = () => {
  const { currentWorkspace, projectSlug } = useUser();
  const { environments } = useEnvironments({
    projectSlug: projectSlug!,
    workspaceSlug: currentWorkspace.slug,
  });

  const {
    secrets,
    secretsLoading,
  } = useSecrets(currentWorkspace.name, projectSlug!);

  const [selectedEnvironment, setSelectedEnvironment] = useState(
    environments?.[0].name!
  );

  useEffect(() => {
    setSelectedEnvironment(environments?.[0].name!);
  }, [environments]);
  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-x-6">
          <Select
            onValueChange={(value) => {
              setSelectedEnvironment(value);
            }}
            value={selectedEnvironment}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue
              // defaultValue={environment}
              />
            </SelectTrigger>
            <SelectContent>
              {environments?.map((environment) => (
                <SelectItem value={environment.name}>
                  {environment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* {secrets?.length > 0 && (
            <p className="text-sm">{secrets?.length} secrets</p>
          )} */}
        </div>

        <div className="flex items-center gap-x-2">
          {/* {noOfChanges > 0 && (
            <span className="text-sm text-yellow-500">
              {noOfChanges} unsaved changes
            </span>
          )} */}

          <Button
          // disabled={!noOfChanges}
          // onClick={handleSaveChanges}
          // isLoading={saveChangesLoading}
          >
            Save Changes
          </Button>
          {/* <AddSecretsDialog
            workspaceSlug={workspaceSlug}
            projectSlug={projectSlug}
            selectedEnvironment={environment}
          /> */}
        </div>
      </div>

      {/* <SecretsList secrets={secrets} isLoading={secretsLoading} /> */}
    </div>
  );
};

export default Page;

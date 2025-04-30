import { getWorkspaces } from "@/api/workspaces";
import { log } from "@/cli";
import getColor from "@/utils/get-color";
import { isAxiosError } from "axios";
import inquirer from "inquirer";
export interface SelectWorkspaceOptions {
  name?: string;
}

export default async (options: SelectWorkspaceOptions) => {
  try {
    // log.text = getColor({
    //   color: "CYAN",
    //   text: "Getting Available Workspaces",
    // });
    // log.start();
    // const { data: allWorkspace } = await getWorkspaces();
    // console.log(allWorkspace);
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error: any) => {
  log.clear();
  log.stopAndPersist();
  console.clear();

  if (isAxiosError(error)) {
    const { response } = error;
    if (response?.status == 401) {
      console.log(
        getColor({
          color: "RED",
          text: "⚠️ Unauthorized. Please log in first.",
        })
      );
      console.log("Run `keypper login` to authenticate.");
      console.log(
        getColor({
          style: "DIM",
          text: "Learn more: https://docs.keypper.dev/v1/authenication#login",
        })
      );
    }
  }
  // console.log(error)
};

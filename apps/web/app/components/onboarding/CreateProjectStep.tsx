import Card from "../interface/card";
import { Input } from "../interface/input";
import { Textarea } from "../interface/textarea";

interface CreateProjectStepProps {
  project: { name: string; description: string };
  setProject: (project: { name: string; description: string }) => void;
}

export function CreateProjectStep({
  project,
  setProject,
}: CreateProjectStepProps) {
  return (
    <Card className="flex flex-col gap-y-2 items-center max-w-lg w-full">
      <img src="/logo/icon.png" alt="logo" className="w-10" />

      <h1 className="text-2xl text-center mt-5">Create your first project</h1>
      <p className="text-lg text-muted-foreground text-center">
        Create a project to start managing your secrets.
      </p>
      <div className="flex flex-col gap-y-2 mt-5 w-full">
        <Input
          placeholder="Project Name"
          value={project?.name}
          onChange={(e) => setProject({ ...project, name: e.target.value })}
        />
        <Textarea
          placeholder="Project Description"
          value={project?.description}
          onChange={(e) =>
            setProject({ ...project, description: e.target.value })
          }
        />
      </div>
    </Card>
  );
}

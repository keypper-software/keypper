import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/interface/button";
import { Input } from "~/components/interface/input";
import Modal from "~/components/interface/modal";
import { Textarea } from "~/components/interface/textarea";
import ProjectCard from "~/components/workspace/projects/project-card";
import { Project } from "~/interfaces";
import api from "~/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_authenticated/$workspaceSlug/_dashboard/projects/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug } = Route.useParams();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Form state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects", workspaceSlug],
    queryFn: async () => {
      try {
        const res = await api.get(`/api/${workspaceSlug}/projects`);
        return res.data;
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
        throw error;
      }
    },
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await api.post(`/api/${workspaceSlug}/projects`, {
          name: projectName,
          description: projectDescription,
        });
        return res.data;
      } catch (error) {
        console.error("Error creating project:", error);
        toast.error("Failed to create project");
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch projects query
      queryClient.invalidateQueries({ queryKey: ["projects", workspaceSlug] });
      // Reset form and close modal
      setProjectName("");
      setProjectDescription("");
      setIsOpen(false);
      toast.success("Project created successfully");
    },
  });

  const handleCreateProject = () => {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    createProjectMutation.mutate();
  };

  return (
    <div>
      <Modal
        title="Create Project"
        description="Create a new project to manage your secrets across Development, Staging and Production environments."
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="space-y-4">
          <Input
            placeholder="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <Textarea
            placeholder="Project Description (optional)"
            className="h-32"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={handleCreateProject}
            disabled={createProjectMutation.isPending}
            isLoading={createProjectMutation.isPending}
          >
            Create Project
          </Button>
        </div>
      </Modal>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button
          className="flex items-center gap-2 px-4"
          onClick={() => setIsOpen(true)}
        >
          <Plus size={16} />
          Create Project
        </Button>
      </div>
      {isLoading && (
        <div className="mt-10 text-center flex justify-center items-center">
          <Loader2 className="animate-spin" size={24} />
        </div>
      )}
      {error && (
        <div className="mt-10 text-center text-red-500">
          Error loading projects
        </div>
      )}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

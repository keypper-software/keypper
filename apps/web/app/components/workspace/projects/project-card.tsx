import { Link } from "@tanstack/react-router";
import { FC } from "react";
import { Project } from "~/interfaces";
import { useWorkspaceStore } from "~/stores/workspace";
import moment from "moment";

const ProjectCard: FC<{ project: Project }> = ({ project }) => {
  const { currentWorkspace } = useWorkspaceStore();
  return (
    <Link
      to="/$workspaceSlug/projects/$projectSlug"
      params={{
        projectSlug: project.slug,
        workspaceSlug: currentWorkspace?.slug!,
      }}
      className="flex flex-col justify-between p-4 border border-gray-001 hover:bg-gray-001/10 hover:border-accent rounded-2xl h-36"
    >
      <div className="">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </div>
      <p className="text-sm text-muted-foreground">
        Updated {moment(project.lastUpdated).fromNow()}
      </p>
    </Link>
  );
};

export default ProjectCard;

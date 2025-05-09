// import { Link } from "@tanstack/react-router";
// import { Project } from "@/interfaces";
import { FC } from "react";
import moment from "moment";
import { AppRoute, Link } from "@/components/interface/link";
import { Project } from "@/lib/apis/projects";

const ProjectCard: FC<{ project: Project; link: string }> = ({
  project,
  link,
}) => {
  return (
    <Link
      to={link as AppRoute}
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

"use client";
import { Button } from "@/components/interface/button";
import { Input } from "@/components/interface/input";
import IsEmpty from "@/components/interface/is-empty";
import Modal from "@/components/interface/modal";
import { Textarea } from "@/components/interface/textarea";
import Header from "@/components/workspace/header";
import ProjectCard from "@/components/workspace/projects/project-card";
import { useUser } from "@/context/user-context";
import { getProjectsFn } from "@/lib/apis/projects";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import React, { useState } from "react";

const Page = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currentWorkspace } = useUser();

  const projects = useQuery({
    queryFn: () => getProjectsFn({ workspaceSlug: currentWorkspace.slug }),
    queryKey: ["projects", currentWorkspace.slug],
  });

  const allProjects = projects.data?.data || [];

  const renderLogic = () => {
    if (projects.isLoading) {
      return <div className="">Projects loading</div>;
    }

    if (projects.isError) {
      return (
        <IsEmpty
          title="No Projects Available"
          info="An error occurred while fetching projects"
        >
          <Button
            className="flex my-2 items-center text-sm cursor-pointer gap-2 px-4"
            onClick={() => setIsOpen(true)}
          >
            <Plus size={16} />
            Create Project
          </Button>
        </IsEmpty>
      );
    }

    if (allProjects.length == 0) {
      <IsEmpty
        title="No Projects Available"
        info="You have to create a new porject or get invited to one."
      >
        <Button
          className="flex my-2 items-center text-sm cursor-pointer gap-2 px-4"
          onClick={() => setIsOpen(true)}
        >
          <Plus size={16} />
          Create Project
        </Button>
      </IsEmpty>;
    }

    return (
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allProjects.map((project, index) => (
          <ProjectCard
            key={index}
            link={`/${currentWorkspace.slug}/projects/${project.slug}`}
            project={project}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <Header
        title="Projects"
        action={
          <Button
            className="flex items-center text-sm cursor-pointer gap-2 px-4"
            onClick={() => setIsOpen(true)}
          >
            <Plus size={16} />
            Create Project
          </Button>
        }
      />

      <Modal
        title="Create Project"
        description="Create a new project to manage your secrets across Development, Staging and Production environments."
        isOpen={isOpen}
        onClose={() => !isLoading && setIsOpen(false)}
        size="md"
      >
        <div className="space-y-6 py-2">
          <div className="relative">
            <Input
              id="project-name"
              placeholder=" "
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-[#121214] border-white/5 text-white pt-4 px-3 pb-2 peer focus:ring-1 focus:ring-accent focus:border-accent rounded-lg"
            />
            <label
              htmlFor="project-name"
              className="absolute text-xs text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-accent"
            >
              Project Name
            </label>
          </div>

          <div className="relative">
            <Textarea
              id="project-description"
              placeholder=" "
              className="w-full h-32 bg-[#121214] border-white/5 text-white pt-4 px-3 pb-2 peer focus:ring-1 focus:ring-accent focus:border-accent resize-none rounded-lg"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
            <label
              htmlFor="project-description"
              className="absolute text-xs text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-gray-400 peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-accent"
            >
              Description (Optional)
            </label>
          </div>

          <div className="bg-gray-900/30 rounded-lg p-3 border border-gray-800">
            <h4 className="text-xs font-medium text-gray-400 mb-3">
              Default Environments
            </h4>
            <div className="flex items-center gap-2">
              {["Development", "Staging", "Production"].map((env) => (
                <div
                  key={env}
                  className="px-3 py-1.5 text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700 flex items-center gap-1"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      env === "Development"
                        ? "bg-green-500"
                        : env === "Staging"
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  ></span>
                  {env}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {/*  */}
          </div>
        </div>
      </Modal>

      <div className="" key={currentWorkspace.slug}>
        {renderLogic()}
      </div>
    </div>
  );
};

export default Page;

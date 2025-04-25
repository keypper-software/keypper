import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { use, useEffect, useState } from "react";
import { Button } from "~/components/interface/button";
import { Input } from "~/components/interface/input";
import { Textarea } from "~/components/interface/textarea";
import Editor from "~/components/workspace/Editor";
import axios from "axios";
import { CreateProjectStep } from "~/components/onboarding/CreateProjectStep";
import { WelcomeStep } from "~/components/onboarding/WelcomeStep";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { set } from "zod";
import api from "~/lib/api";
import Card from "~/components/interface/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/$workspaceSlug/welcome")({
  component: RouteComponent,
});

function RouteComponent() {
  const { workspaceSlug } = Route.useParams();
  const [currentStep, setCurrentStep] = useState("3");

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
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

  const [project, setProject] = useState<{
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });

  const [code, setCode] = useState(``);
  const [emails, setEmails] = useState<string[]>([]);

  const extractSecrets = (input: string): Record<string, string> | null => {
    const secrets: Record<string, string> = {};
    const lines = input.split("\n");
    let isValid = true;

    lines.forEach((line) => {
      const [key, value] = line.split("=");
      if (!key || !value) {
        isValid = false;
      } else {
        secrets[key.trim()] = value.trim();
      }
    });

    if (!isValid) {
      toast.error(
        "Invalid input: Each line must contain a key and a value separated by '='."
      );
      return null;
    }

    return secrets;
  };

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectSlug, setNewProjectSlug] = useState("");

  const createProject = async () => {
    if (!project.name) {
      toast.error("Project name is required");
      return;
    }

    try {
      setIsCreatingProject(true);
      const response = await api.post(
        `/api/${workspaceSlug || projects?.[0]?.slug}/projects`,
        {
          name: project.name,
          description: project.description,
        }
      );
      setNewProjectSlug(response.data.project.slug);
      setCurrentStep("2");
      toast.success("Project created successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const [addingSecrets, setAddingSecrets] = useState(false);

  const environments = ["Production", "Staging", "Development"];

  const [environment, setEnvironment] = useState(environments[0]);

  const addSecrets = async () => {
    const secrets = extractSecrets(code);
    if (!secrets) return;
    try {
      setAddingSecrets(true);
      await api.post(
        `/api/${workspaceSlug}/${newProjectSlug || projects?.[0]?.slug}/secrets?environment=${environment}`,
        {
          secrets: Object.entries(secrets).map(([key, value]) => ({
            key,
            value,
          })),
        }
      );
      toast.success("Secrets added successfully");
      setCurrentStep("3");
    } catch (error) {
      console.error("Error adding secrets:", error);
      toast.error("Failed to add secrets");
    } finally {
      setAddingSecrets(false);
    }
  };

  const [isInviting, setIsInviting] = useState(false);

  const inviteTeam = async () => {
    if (emails.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    try {
      setIsInviting(true);
      await api.post(`/api/${workspaceSlug}/invitation`, {
        emails: emails,
      });
      setCurrentStep("4");
      toast.success("Invitations sent successfully");
    } catch (error) {
      console.error("Error inviting team:", error);
      toast.error("Failed to send invitations");
    } finally {
      setIsInviting(false);
    }
  };

  const navigate = useNavigate();

  const steps = {
    "0": {
      component: <WelcomeStep onNext={() => setCurrentStep("1")} />,
      next: () => setCurrentStep("1"),
      isSkippable: false,
    },
    "1": {
      component: (
        <CreateProjectStep project={project} setProject={setProject} />
      ),
      next: () => createProject(),
      isLoading: isCreatingProject,
      isSkippable: true,
      skip: () => setCurrentStep("3"),
    },
    "2": {
      component: (
        <div className="flex flex-col items-center max-w-lg w-full justify-center gap-y-2">
          <Card className="flex flex-col gap-y-2 items-center w-full mt-5">
            <img src="/logo/icon.png" className="w-10" alt="" />
            <h1 className="text-2xl text-center mt-5">
              Add your first secrets
            </h1>
            {/* <p className="text-muted-foreground text-center">
              Add your first secrets to your project.
            </p> */}
            <div className="mt-5 bg-gray-002 rounded-md w-full h-[250px]">
              <Editor
                value={code}
                onChange={setCode}
                placeholder="Paste your environment variables here..."
              />
            </div>
            <div className="mt-2 flex w-full gap-x-2 items-center">
              <span className="text-muted-foreground">Environment</span>
              <Select
                value={environment}
                onValueChange={(value) => setEnvironment(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue defaultValue={environment} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {environments.map((e, i) => (
                      <SelectItem value={e} key={i}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>
      ),
      next: () => addSecrets(),
      isLoading: addingSecrets,
      isSkippable: true,
      skip: () => setCurrentStep("3"),
    },
    "3": {
      component: (
        <Card className="flex flex-col gap-y-2 max-w-lg w-full items-center">
          <img src="/logo/icon.png" className="w-10" alt="" />
          <h1 className="text-2xl text-center mt-5">Invite your team</h1>
          <p className="text-muted-foreground text-center">
            Invite your team to your project.
          </p>
          <div className="mt-5 w-full">
            <Textarea
              placeholder="Enter email addresses separated by commas or spaces..."
              className="min-h-[100px]"
              onChange={(e) => {
                const emailList = e.target.value
                  .split(/[\s,]+/)
                  .filter((email) => email.trim().length > 0)
                  .filter((email) =>
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
                  );
                setEmails(emailList);
              }}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Example: john@example.com, jane@example.com
            </p>
            {emails.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2 mt-2">
                  {emails.map((email, index) => (
                    <div
                      key={index}
                      className="bg-accent/10 text-accent text-xs p-2 rounded-lg"
                    >
                      {email}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ),
      next: () => inviteTeam(),
      isLoading: isInviting,
      isSkippable: true,
      skip: () => setCurrentStep("4"),
      disabled: emails.length === 0,
    },
    "4": {
      component: (
        <div>
          <h1 className="text-3xl font-bold text-center">You're all set!</h1>
          <p className="text-lg text-muted-foreground text-center">
            You're all set! You can now start managing your secrets.
          </p>
        </div>
      ),
      next: () => {
        navigate({
          to: "/$workspaceSlug/getting-started",
          params: {
            workspaceSlug: workspaceSlug,
          },
        });
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen relative bg-black-bg">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full mx-auto flex flex-col items-center justify-center gap-y-4"
        >
          {steps[currentStep].component}
        </motion.div>
      </AnimatePresence>
      <Button
        className="mt-5 max-w-lg w-full py-3 text-base"
        onClick={() => steps[currentStep].next()}
        isLoading={steps[currentStep].isLoading}
        disabled={steps[currentStep]?.disabled}
      >
        {currentStep === "0" ? "Get Started" : "Continue"}
      </Button>
      {steps[currentStep].isSkippable && (
        <Button
          variant="ghost"
          className="mt-3 max-w-lg w-full py-3 text-base"
          onClick={() => steps[currentStep].skip()}
        >
          Skip
        </Button>
      )}
      {/* <div className="absolute bottom-0 left-0 w-full h-10">
        <div className="absolute bottom-10 left-0 w-full flex justify-center gap-2">
          {Object.keys(steps).map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full cursor-pointer ${
                currentStep === step ? "bg-white" : "bg-gray-500"
              }`}
              onClick={() => setCurrentStep(step)}
            />
          ))}
        </div>
      </div> */}
    </div>
  );
}

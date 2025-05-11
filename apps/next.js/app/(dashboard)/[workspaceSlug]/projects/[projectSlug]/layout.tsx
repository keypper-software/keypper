"use client";
import { Button } from "@/components/interface/button";
import IsEmpty from "@/components/interface/is-empty";
import { AppRoute, Link } from "@/components/interface/link";
import Header from "@/components/workspace/header";
import { useUser } from "@/context/user-context";
import useEnvironments from "@/hooks/useEnvironments";
import { cn } from "@/lib/utils";
import { Ellipsis, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import { PacmanLoader } from "react-spinners";
import {
  ServerSquareCloud,
  FireMinimalistic,
  SidebarMinimalistic,
  UsersGroupTwoRounded,
} from "solar-icon-set";

const tabs = [
  {
    label: "Environments",
    href: "",
    icon: ServerSquareCloud,
  },
  {
    label: "Activities",
    href: "/activities",
    icon: FireMinimalistic,
  },
  {
    label: "Compare",
    href: "/compare",
    icon: SidebarMinimalistic,
  },
  {
    label: "People",
    href: "/people",
    icon: UsersGroupTwoRounded,
  },
];

const Layout = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { currentWorkspace, projectSlug } = useUser();
  const router = useRouter();
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");

  const { environments, loading, isError } = useEnvironments({
    projectSlug: projectSlug!,
    workspaceSlug: currentWorkspace.slug,
  });

  useEffect(() => {
    const currentTab = tabs.find(
      (tab) =>
        pathname ===
        `/${currentWorkspace.slug}/projects/${projectSlug}${tab.href}`
    );
    setActiveTab(currentTab?.label || tabs[0].label);
  }, [pathname, currentWorkspace.slug, projectSlug]);

  const isActiveTab = (tabHref: string) => {
    return (
      pathname === `/${currentWorkspace.slug}/projects/${projectSlug}${tabHref}`
    );
  };

  return (
    <div>
      <Header
        loading={loading}
        action={
          <Button variant="outline">
            <Ellipsis size={20} className="text-accent" />
          </Button>
        }
        title={
          environments?.length == 0 || isError
            ? "Project not found"
            : projectSlug!
        }
      />

      <div className="hidden md:flex items-center gap-x-5 my-4 bg-white/10 rounded-md p-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            to={
              `/${currentWorkspace.slug}/projects/${projectSlug}${tab.href}` as AppRoute
            }
          >
            <div
              className={cn(
                "flex items-center py-1 px-3 gap-2 font-medium text-sm cursor-pointer hover:bg-white/10 transition-all duration-300 rounded-md",
                isActiveTab(tab.href) && "text-accent bg-accent/10"
              )}
            >
              {/* @ts-ignore */}
              <tab.icon size={16} iconStyle="Bold" />
              <span>{tab.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="md:hidden my-4">
        <div
          className="flex items-center justify-between bg-white/10 rounded-md p-3 cursor-pointer"
          onClick={() => setMobileTabsOpen(!mobileTabsOpen)}
        >
          <div className="flex items-center gap-2">
            {tabs.map((tab) => {
              if (tab.label === activeTab) {
                return (
                  <React.Fragment key={tab.href}>
                    {/* @ts-ignore */}
                    <tab.icon
                      size={18}
                      iconStyle="Bold"
                      className={isActiveTab(tab.href) ? "text-accent" : ""}
                    />
                    <span
                      className={cn(
                        "font-medium",
                        isActiveTab(tab.href) && "text-accent"
                      )}
                    >
                      {tab.label}
                    </span>
                  </React.Fragment>
                );
              }
              return null;
            })}
          </div>
          <ChevronDown
            size={16}
            className={cn(
              "transition-transform",
              mobileTabsOpen && "rotate-180"
            )}
          />
        </div>

        {mobileTabsOpen && (
          <div className="absolute z-10 mt-1 w-full max-w-[75vw] bg-background border border-white/10 rounded-md shadow-lg">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                to={
                  `/${currentWorkspace.slug}/projects/${projectSlug}${tab.href}` as AppRoute
                }
                onClick={() => {
                  setMobileTabsOpen(false);
                  setActiveTab(tab.label);
                }}
              >
                <div
                  className={cn(
                    "flex items-center p-3 gap-2 text-sm hover:bg-white/10 transition-all duration-300",
                    isActiveTab(tab.href) && "text-accent bg-accent/5"
                  )}
                >
                  {/* @ts-ignore */}
                  <tab.icon size={16} iconStyle="Bold" />
                  <span>{tab.label}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="w-full h-[40vh] flex justify-center items-center">
          <PacmanLoader color="#0edbbd" size={20} />
        </div>
      ) : (
        <div className="">
          {environments?.length == 0 || isError ? (
            <div className="">
              <IsEmpty
                title="Looks like this project does not exist"
                info="Are you sure you're in the right workspace/project?"
              >
                <Link to={`/${currentWorkspace.slug}/projects` as AppRoute}>
                  <Button className="my-4 text-xs px-6">
                    View all Projects
                  </Button>
                </Link>
              </IsEmpty>
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
};

export default Layout;

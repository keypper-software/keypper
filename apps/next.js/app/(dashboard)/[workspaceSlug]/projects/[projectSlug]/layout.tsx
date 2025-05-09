"use client";
import { Button } from "@/components/interface/button";
import { AppRoute, Link } from "@/components/interface/link";
import Header from "@/components/workspace/header";
import { useUser } from "@/context/user-context";
import useEnvironments from "@/hooks/useEnvironments";
import { cn } from "@/lib/utils";
import { Ellipsis } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { ReactNode, useState } from "react";
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

  useEnvironments({
    projectSlug: projectSlug!,
    workspaceSlug: currentWorkspace.slug,
  });

  return (
    <div>
      <Header
        action={
          <Button variant="outline">
            <Ellipsis size={20} className="text-accent" />
          </Button>
        }
        title={projectSlug!}
      />
      <div className="flex items-center gap-x-5 my-4 bg-white/10 rounded-md p-2">
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

                pathname === pathname + tab.href && "text-accent bg-accent/10"
              )}
            >
              {/* @ts-ignore */}
              <tab.icon size={16} iconStyle="Bold" />
              <span>{tab.label}</span>
            </div>
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
};

export default Layout;

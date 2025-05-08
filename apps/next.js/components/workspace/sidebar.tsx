import React, { use, useEffect, useState } from "react";
import Dropdown from "@/components/interface/dropdown";
import { ChevronDown, ChevronsDown, LogOut } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Rocket,
  FolderWithFiles,
  UsersGroupTwoRounded,
  KeyMinimalistic,
  Card,
  SettingsMinimalistic,
  PostsCarouselVertical,
} from "solar-icon-set";
import cn from "classnames";
import { useWorkspaceStore } from "@/stores/workspace";
import { Button } from "../interface/button";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import axios from "axios";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { currentWorkspace, workspaces, setCurrentWorkspace, setWorkspaces } =
    useWorkspaceStore();

  useEffect(() => {
    const fetchWorkspaces = async () => {
      const { data } = await axios.get("/api/workspaces");
      setWorkspaces(data);
      setCurrentWorkspace(data[0]);
    };
    fetchWorkspaces();
  }, []);
  const workspaceSlug = currentWorkspace?.slug!;

  const links = [
    {
      name: "Getting Started",
      href: `/getting-started`,
      icon: Rocket,
    },
    {
      name: "Projects",
      href: `/projects`,
      icon: FolderWithFiles,
    },
    {
      name: "Activities",
      href: `/activities`,
      icon: PostsCarouselVertical,
    },
    {
      name: "Team",
      href: `/team`,
      icon: UsersGroupTwoRounded,
    },
    {
      name: "Share Secrets",
      href: `/share-secrets`,
      icon: KeyMinimalistic,
    },
    {
      name: "Billing",
      href: `/billing`,
      icon: Card,
    },
    {
      name: "Settings",
      href: `/settings`,
      icon: SettingsMinimalistic,
    },
  ];

  const router = useRouter();

  const [activeRoute, setActiveRoute] = useState(
    router.latestLocation.pathname
  );

  const handleLogout = async () => {
    await authClient.signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="w-56 h-screen p-5 relative">
      <img src="/logo/icon.png" alt="Keypper" className="w-[30px]" />
      <div className="mt-5 space-y-1">
        {links.map((link, index) => (
          <Link
            key={index}
            // @ts-ignore
            to={`/$workspaceSlug${link.href}`}
            params={{ workspaceSlug: workspaceSlug }}
            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-white/10 transition-all duration-300 rounded-md text-[#6D6F7E] hover:text-white/90"
            onClick={() => setActiveRoute(`/${workspaceSlug}${link.href}`)}
          >
            <link.icon
              size={16}
              iconStyle="BoldDuotone"
              color={
                activeRoute.startsWith(`/${workspaceSlug}${link.href}`)
                  ? "#0edbbd"
                  : ""
              }
            />
            <p
              className={cn(
                "text-sm",
                activeRoute.startsWith(`/${workspaceSlug}${link.href}`) &&
                  "text-accent"
              )}
            >
              {link.name}
            </p>
          </Link>
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5 w-full">
        <button className="flex items-center justify-between gap-2 p-2 cursor-pointer w-full hover:bg-white/10 transition-all duration-300 rounded-md text-[#6D6F7E] hover:text-white/90">
          <span className="text-sm">{currentWorkspace?.name}</span>{" "}
          <ChevronDown size={16} />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

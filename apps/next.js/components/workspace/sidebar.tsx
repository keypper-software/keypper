"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Menu } from "lucide-react";
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
import { Button } from "../interface/button";
import { useParams, usePathname, useRouter } from "next/navigation";
import { AppRoute, Link } from "../interface/link";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { workspaceSlug } = useParams();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(pathname);

  // Check screen size on mount and when resized
  useEffect(() => {
    const checkScreenSize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);

      // Close mobile sidebar when resizing to desktop
      if (!isMobile && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isMobileOpen]);

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

  const MobileMenuButton = () => (
    <Button
      className="fixed top-4 left-4 z-50 md:hidden"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      variant="ghost"
    >
      <Menu size={24} />
    </Button>
  );

  const handleLinkClick = (path: string) => {
    setActiveRoute(path);
    if (isMobileView) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {isMobileView && <MobileMenuButton />}

      {isMobileView && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "h-screen p-5 flex flex-col justify-between transition-all duration-300 z-40",

          isMobileView
            ? cn(
                "fixed top-0 left-0 shadow-xl",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
              )
            : cn("relative", isCollapsed ? "w-20" : "w-56")
        )}
      >
        <div className="flex items-center justify-between">
          <div className="">
            {isCollapsed && !isMobileView ? (
              <div className="flex justify-center">
                <img src="/logo/icon.png" alt="Keypper" className="w-[30px]" />
              </div>
            ) : (
              <div className="">
                <img
                  src="/logo/wordmark.png"
                  alt="Keypper"
                  className="w-[120px]"
                />
              </div>
            )}
          </div>

          {!isMobileView && (
            <div className="">
              <Button
                className="my-0"
                onClick={() => setIsCollapsed(!isCollapsed)}
                variant="ghost"
              >
                {isCollapsed ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-5 flex-1 space-y-1">
          {links.map((link, index) => {
            const fullPath = `/${workspaceSlug}${link.href}`;
            const isActive = activeRoute.startsWith(fullPath);

            return (
              <Link
                key={index}
                to={`/$workspaceSlug${link.href}` as AppRoute}
                params={{ workspaceSlug: workspaceSlug + "" }}
                className={cn(
                  "flex items-center gap-3 p-2 cursor-pointer hover:bg-white/10 transition-all duration-300 rounded-md text-[#6D6F7E] hover:text-white/90",
                  isCollapsed && !isMobileView && "justify-center"
                )}
                onClick={() => handleLinkClick(fullPath)}
              >
                {/* @ts-ignore */}
                <link.icon
                  size={isCollapsed && !isMobileView ? 24 : 20}
                  iconStyle="BoldDuotone"
                  color={isActive ? "#0edbbd" : ""}
                />
                {(!isCollapsed || isMobileView) && (
                  <p className={cn("text-sm", isActive && "text-accent")}>
                    {link.name}
                  </p>
                )}
              </Link>
            );
          })}
        </div>

        {(!isCollapsed || isMobileView) && (
          <div className="w-full">
            <button className="flex items-center justify-between gap-2 p-2 cursor-pointer w-full hover:bg-white/10 transition-all duration-300 rounded-md text-[#6D6F7E] hover:text-white/90">
              <span className="text-sm">{workspaceSlug}</span>
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;

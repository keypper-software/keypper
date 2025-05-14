"use client";
import Image from "next/image";
import { ChevronsRight, Menu, X } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { AppRoute, Link } from "@/components/interface/link";
import { useState } from "react";
import { useUser } from "@/context/user-context";
import { APP_NAME } from "@/constants";
import { BsShieldFillCheck } from "react-icons/bs";
import { GrNodes } from "react-icons/gr";
import { AiOutlineCloudSync } from "react-icons/ai";
import { TbApiApp, TbLockAccess } from "react-icons/tb";
import { MdOutlineViewAgenda } from "react-icons/md";
import { motion, AnimatePresence } from "motion/react";
import { CgBolt } from "react-icons/cg";
import { RiGitBranchFill } from "react-icons/ri";
import GitHub from "@/components/icons/github";
import Vercel from "@/components/icons/vercel";
import AmazonWebServices from "@/components/icons/aws";
import Netlify from "@/components/icons/netlify";
import Supabase from "@/components/icons/supabase";
import DigitalOcean from "@/components/icons/digitalocean";
import Deno from "@/components/icons/deno";
import Heroku from "@/components/icons/heroku";
import Cloudflare from "@/components/icons/cloudflare";
import Fly from "@/components/icons/fly";
import Railway from "@/components/icons/railway";
import GitLab from "@/components/icons/gitlab";
import Firebase from "@/components/icons/firebase";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const links = [
    {
      title: "Pricing",
      href: "/pricing",
    },
    {
      title: "Documentation",
      href: "/docs",
    },
  ];

  const { currentWorkspace, success, workspaces } = useUser();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const dashboardLink = (
    !!workspaces.length ? `/${workspaces[0]?.slug}` : "/onboarding"
  ) as AppRoute;

  const features = [
    {
      title: "Complete Security",
      description:
        "End-to-end encryption ensures your secrets are safe, only you can access them.",
      icon: BsShieldFillCheck,
    },
    {
      title: "Seamless Integration",
      description:
        "Connect with your favorite CI/CD tools, cloud providers, and third-party services effortlessly.",
      icon: GrNodes,
    },
    {
      title: "Real-time sync",
      description:
        "Keep all your secrets in sync across all environments from development to production.",
      icon: AiOutlineCloudSync,
    },
    {
      title: "Granular Access Control",
      description:
        "Assign specific secrets to different teams or users, ensuring everyone has the right access.",
      icon: TbLockAccess,
    },
    {
      title: "Audit Logs",
      description:
        "Track all changes to your secrets, who made them, and when for complete transparency.",
      icon: MdOutlineViewAgenda,
    },
    {
      title: "API Access",
      description:
        "Access your secrets programmatically via our secure API — perfect for automation and integration.",
      icon: TbApiApp,
    },
  ];

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setActiveCard(index);
  };

  const handleMouseLeave = () => {
    setActiveCard(null);
  };

  const moreFeatures = [
    {
      title: "Multi-environment support",
      description:
        "Manage secrets across Dev, Staging, and Production with zero friction.",
      component: (
        <div className="flex flex-col gap-y-3 w-full">
          {["Development", "Staging", "Production"].map((env) => (
            <div
              key={env}
              className="p-3 text-sm rounded-lg w-full text-gray-300 bg-gradient-to-b from-accent/5 to-accent/10 border border-white/10 flex items-center gap-2"
            >
              <span
                className={`size-2 animate-pulse rounded-full ${
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
      ),
    },
    {
      title: "Instant Rollback",
      description:
        "Messed up a config? Instantly revert to a previous version with two clicks.",
      component: (
        <>
          <CgBolt size={200} className="text-accent" />
        </>
      ),
    },
    {
      title: "Branch-Based Secrets",
      description: "Isolate secrets per branch for better version control.",
      component: (
        <>
          <RiGitBranchFill size={200} className="text-accent" />
        </>
      ),
    },
  ];

  const integrations = [
    {
      title: "GitHub",
      logo: GitHub,
    },
    {
      title: "Vercel",
      logo: Vercel,
    },
    {
      title: "AWS",
      logo: AmazonWebServices,
    },
    {
      title: "Netlify",
      logo: Netlify,
    },
    {
      title: "Supabase",
      logo: Supabase,
    },
    {
      title: "DigitalOcean",
      logo: DigitalOcean,
    },
    {
      title: "Deno",
      logo: Deno,
    },
    {
      title: "Heroku",
      logo: Heroku,
    },
    {
      title: "Cloudflare",
      logo: Cloudflare,
    },
    {
      title: "Fly",
      logo: Fly,
    },
    {
      title: "Railway",
      logo: Railway,
    },
    {
      title: "GitLab",
      logo: GitLab,
    },
    {
      title: "Firebase",
      logo: Firebase,
    },
  ];

  return (
    <div className="">
      <div className="w-full bg-[#131c22] min-h-screen relative overflow-hidden">
        <div className="absolute -top-[900px] right-[20%] w-[1000px] h-[1000px] bg-accent/50 blur-3xl rounded-full"></div>
        <div className="max-w-screen-xl overflow-hidden mx-auto p-3 md:p-5">
          <div className="flex items-center justify-between p-3 md:p-5 bg-accent/10 rounded-full mt-2 md:mt-5 border border-accent/20">
            <div className="flex items-center">
              <img
                src="/logo/wordmark.png"
                alt="Keypper"
                className="w-[100px] md:w-[120px]"
              />

              <div className="hidden md:flex gap-x-4 ml-10">
                {links.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href as any}
                    className="text-sm text-white hover:text-accent transition-colors font-semibold"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden md:flex gap-x-5 items-center">
              <div className="flex gap-x-2 items-center text-white border rounded-full py-2 px-4 border-accent bg-accent/10">
                <SiGithub />
                <span className="text-xs">6,942 stars</span>
              </div>

              {!success ? (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-white hover:text-accent transition-colors font-semibold"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Get Started
                  </Link>
                </>
              ) : (
                <Link
                  to={dashboardLink}
                  className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Dashboard
                </Link>
              )}
            </div>

            <button className="md:hidden text-white" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-[#131c22] bg-opacity-95 pt-20 px-5">
              <div className="flex flex-col gap-y-4">
                <div className="">
                  <button
                    className="text-white absolute top-0 right-0 m-5"
                    onClick={toggleMobileMenu}
                  >
                    {<X size={24} />}
                  </button>
                </div>

                {links.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href as any}
                    className="text-lg text-white hover:text-accent transition-colors font-semibold"
                  >
                    {link.title}
                  </Link>
                ))}

                <div className="mt-6 pt-6 border-t border-accent/20">
                  <div className="flex gap-x-2 items-center text-white border rounded-full py-2 px-4 border-accent bg-accent/10 w-fit mb-4">
                    <SiGithub />
                    <span className="text-xs">6,942 stars</span>
                  </div>

                  {!success ? (
                    <div className="flex flex-col gap-y-3">
                      <Link
                        to="/login"
                        className="text-white hover:text-accent transition-colors font-semibold"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/signup"
                        className="bg-accent text-black px-4 py-2 rounded-lg font-semibold text-center"
                      >
                        Get Started
                      </Link>
                    </div>
                  ) : (
                    <Link
                      to={dashboardLink}
                      className="bg-accent text-black px-4 py-2 rounded-lg font-semibold block text-center"
                    >
                      Dashboard
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse md:flex-row justify-between items-center px-2 md:px-10 mt-10 md:mt-20">
            <div className="w-full md:w-1/2 space-y-6 md:space-y-8 text-center md:text-left mt-8 md:mt-0">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-semibold text-white">
                Secret manager <br className="hidden md:block" /> from the
                future
              </h1>
              <p className="text-gray-300 text-base md:text-lg">
                Effortlessly secure and manage tokens, credentials, and
                encryption keys across all environments — via UI, CLI, or API.
              </p>
              <div className="flex flex-col sm:flex-row gap-y-4 gap-x-4 justify-center md:justify-start">
                <Link to="/signup">
                  <button className="bg-accent/10 text-accent py-2 md:py-3 border-2 border-accent px-6 md:px-8 font-semibold rounded-full text-sm flex items-center gap-x-2 hover:bg-accent hover:text-black transition-colors justify-center md:justify-start">
                    Get Started <ChevronsRight />
                  </button>
                </Link>
                <Link
                  to="/"
                  className="flex items-center gap-x-2 justify-center md:justify-start"
                >
                  <SiGithub />
                  <span className="">Star on GitHub</span>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-[40%]">
              <img src="/images/hero.png" alt="hero" className="w-full" />
            </div>
          </div>
        </div>

        {/**Rest of the page */}
        <div className="max-w-screen-xl mx-auto p-3 md:p-5 mt-20 space-y-30">
          {/***Why Keypper? */}
          <div className="">
            <h2 className="text-4xl font-semibold text-accent">
              Why {APP_NAME}?
            </h2>
            <p className="text-gray-300 text-base md:text-lg mt-2">
              No more scattered secrets. No more manual configurations. <br />
              {APP_NAME} is your single source of truth for managing sensitive
              data, built to scale with you.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="relative flex flex-col gap-y-2 bg-gradient-to-b from-accent/1 to-accent/3 border border-accent/30 rounded-2xl p-5 overflow-hidden hover:border-accent/50 transition-all duration-300"
                  onMouseMove={(e) => handleMouseMove(e, index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <AnimatePresence>
                    {activeCard === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute w-[200px] h-[200px] rounded-full bg-accent/10 blur-3xl pointer-events-none"
                        style={{
                          left: mousePosition.x - 50,
                          top: mousePosition.y - 50,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    )}
                  </AnimatePresence>
                  <feature.icon size={30} />
                  <h3 className="text-lg font-semibold text-white mt-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-base">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="">
            <h2 className="text-4xl font-semibold text-accent">
              Features Built for Scale
            </h2>
            <p className="text-gray-300 text-base md:text-lg mt-2">
              The last secret manager you'll ever need.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {moreFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="relative bg-gradient-to-b from-accent/1 to-accent/3 h-[400px] border border-accent/30 rounded-2xl overflow-hidden hover:border-accent/50 transition-all duration-300 flex flex-col gap-y-2 p-5"
                  onMouseMove={(e) =>
                    handleMouseMove(e, index + features.length)
                  }
                  onMouseLeave={handleMouseLeave}
                >
                  <AnimatePresence>
                    {activeCard === index + features.length && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute w-[200px] h-[200px] rounded-full bg-accent/10 blur-3xl pointer-events-none"
                        style={{
                          left: mousePosition.x - 50,
                          top: mousePosition.y - 50,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    )}
                  </AnimatePresence>
                  <div className="w-full h-full flex items-center justify-center">
                    {feature.component}
                  </div>
                  <div className="">
                    <h3 className="text-lg font-semibold text-white mt-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="">
            <h2 className="text-4xl font-semibold text-accent">
              Powerful Integrations
            </h2>
            <p className="text-gray-300 text-base md:text-lg mt-2">
              Works with your stack, not against it.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {integrations.map((integration, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-b from-accent/1 to-accent/3 border border-accent/30 rounded-2xl p-5 flex flex-col gap-y-2 items-center"
                >
                  <integration.logo fontSize={50} />
                  <span>{integration.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

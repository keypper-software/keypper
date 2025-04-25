import { useRouteContext } from "@tanstack/react-router";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ChevronsRight } from "lucide-react";
import { SiGithub } from "react-icons/si";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    return { userId: context.userId, organization: context.organization };
  },
});

function RouteComponent() {
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

  const { userId, organization } = useRouteContext({ from: "/" });

  return (
    <div className="">
      <div className="w-full bg-[#131c22] min-h-screen relative overflow-hidden">
        <div className="absolute -top-[900px] right-[20%] w-[1000px] h-[1000px] bg-accent/50 blur-3xl rounded-full"></div>
        <div className="max-w-screen-xl overflow-hidden mx-auto p-5">
          <div className="flex items-center justify-between p-5 bg-accent/10 rounded-full mt-5 border border-accent/20">
            <div className="flex gap-x-10 items-center">
              <img
                src="/logo/wordmark.png"
                alt="Keypper"
                className="w-[120px]"
              />
              <div className="flex gap-x-4">
                {links.map((link) => (
                  <Link
                    to={link.href}
                    className="text-sm text-white hover:text-accent transition-colors font-semibold"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex gap-x-5 items-center">
              <div className="flex gap-x-2 items-center text-white border rounded-full py-2 px-4 border-accent bg-accent/10">
                <SiGithub />
                <span className="text-xs">6,942 stars</span>
              </div>

              {!userId ? (
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
                  to="/$workspaceSlug"
                  params={{ workspaceSlug: organization?.slug! }}
                  className="bg-accent text-black px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center px-10 mt-20">
            <div className="w-1/2 space-y-8">
              <h1 className="text-7xl font-semibold text-white">
                Secret manager <br /> from the future
              </h1>
              <p className="text-gray-300 text-lg">
                Effortlessly secure and manage tokens, credentials, and
                encryption keys across all environments — via UI, CLI, or API.
              </p>
              <div className="flex gap-x-4">
                <button className="bg-accent/10 text-accent py-3 border-2 border-accent px-8 font-semibold rounded-full text-sm flex items-center gap-x-2 hover:bg-accent hover:text-black transition-colors">
                  Get Started <ChevronsRight />
                </button>
                <Link to="." className="flex items-center gap-x-2">
                  <SiGithub />
                  <span className="">Star on GitHub</span>
                </Link>
              </div>
            </div>
            <div className="w-[40%]">
              <img src="/images/hero.png" alt="hero" className="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import Image from "next/image";
import { ChevronsRight, Menu, X } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { AppRoute, Link } from "@/components/interface/link";
import { useState } from "react";
import { useUser } from "@/context/user-context";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const { currentWorkspace, success } = useUser();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const dashboardLink = (
    !!currentWorkspace ? `/${currentWorkspace?.slug}` : "/onboarding"
  ) as AppRoute;

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
      </div>
    </div>
  );
}

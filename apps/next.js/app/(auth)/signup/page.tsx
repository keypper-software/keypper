import { SiGoogle } from "react-icons/si";
import ContinueWithGitHub from "@/components/auth/ContinueWithGitHub";
import { Button } from "@/components/interface/button";
import { APP_NAME } from "@/constants";
import { Link } from "@/components/interface/link";

function Page() {
  return (
    <div className="h-screen bg-background flex flex-col items-start justify-center space-y-5 relative">
       <div className="absolute -top-[900px] right-0 w-[1000px] h-[1000px] bg-accent/50 blur-3xl rounded-full animate-pulse"></div>
      <div className="absolute -bottom-[500px] left-0 w-[600px] h-[600px] bg-accent/30 blur-3xl rounded-full opacity-60 hidden md:block"></div>

      <div className=" max-w-2xl p-8 w-full mx-auto">
        <Link to="/">
          <img src="/logo/icon.png" alt="Keypper" className="w-[60px]" />
        </Link>
      <h3 className="text-foreground mt-3 text-3xl font-medium">
          Welcome to {APP_NAME}
        </h3>
        <p className="text-muted-foreground">Create an account to continue.</p>
        <div className="space-x-5 my-5 flex-wrap gap-y-3flex">
          <ContinueWithGitHub />
          <Button className="flex items-start gap-x-2 px-10 py-3 text-base bg-black text-foreground">
            <SiGoogle size={20} /> Continue with Google
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Page;

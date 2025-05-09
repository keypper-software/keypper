import React, { ReactNode } from "react";
import Sidebar from "@/components/workspace/sidebar";

type Props = {
  children: ReactNode;
};

const Layout = (props: Props) => {
  return (
    <div className="flex h-screen bg-black-bg text-white">
      <Sidebar />
      <div className="p-5 pl-0 flex-1 h-full">
        <div className="py-5 px-10 bg-[#121214] rounded-2xl border border-white/5 w-full h-full overflow-y-auto">
          {/* <Chat /> */}
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default Layout;

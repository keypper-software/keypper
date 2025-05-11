import { PacmanLoader } from "react-spinners";
import React, { ReactNode } from "react";

type Props = {
  action?: ReactNode;
  title: string;
  loading?: boolean;
};

const Header = (props: Props) => {
  return (
    <div className="flex border-b pb-4 border-b-white/5 items-center justify-between">
      {props.loading ? (
        <div className=""></div>
      ) : (
        <h1 className="text-2xl font-bold">{props.title}</h1>
      )}
      {props?.action}
    </div>
  );
};

export default Header;

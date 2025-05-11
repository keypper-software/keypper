import Image from "next/image";
import React, { ReactNode } from "react";

type Props = {
  image?: any;
  title: string;
  info?: string;
  children?: ReactNode;
};

const IsEmpty = (props: Props) => {
  return (
    <div className="max-w-2xl mx-auto p-8 gap-2 flex flex-col justify-center items-center">
      <Image
        src={props?.image || "/images/states/empty-1.svg"}
        alt={props.title}
        width={400}
        height={400}
      />
      <h4 className="text-2xl font-bold">{props.title}</h4>
      <h4 className="text-sm text-white/50">{props.info}</h4>
      {props.children}
    </div>
  );
};

export default IsEmpty;

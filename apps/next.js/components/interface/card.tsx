import React from "react";

const Card = ({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  return (
    <div
      className={`bg-card-bg rounded-3xl border border-border-muted p-10 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;

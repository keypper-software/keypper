import { Circle, Paperclip, Plus, X } from "lucide-react";

export const getActivityIconBg = (event: string) => {
  console.log(event);
  if (event.toLowerCase().includes("secret")) {
    return "bg-gray-200 text-gray-500";
  } else if (event.toLowerCase().includes("project created")) {
    return "bg-green-200 text-green-500";
  } else if (event.toLowerCase().includes("project deleted")) {
    return "bg-red-100 text-red-500";
  } else if (event.toLowerCase().includes("environment created")) {
    return "bg-yellow-200 text-yellow-500";
  } else {
    return "bg-gray-200 text-gray-500";
  }
};

export const getActivitytIcon = (event: string) => {
  if (event.toLowerCase().includes("secret")) {
    return <Paperclip size={12} />;
  } else if (event.toLowerCase().includes("project created")) {
    return <Plus size={12} />;
  } else if (event.toLowerCase().includes("project deleted")) {
    return <X size={12} />;
  } else if (event.toLowerCase().includes("environment created")) {
    return <Plus size={12} />;
  } else {
    return <Circle size={12} />;
  }
};

import React from "react";

const DashboardSkeleton = () => {
  return (
    <div className="flex p-8 flex-col gap-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-gray-700 rounded-md"></div>
        <div className="h-8 w-24 bg-gray-700 rounded-md"></div>
      </div>

      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="flex gap-4">
            <div className="h-10 w-10 bg-gray-700 rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gray-700 rounded-md"></div>

              <div className="h-4 w-full bg-gray-700 rounded-md"></div>
              <div className="h-4 w-5/6 bg-gray-700 rounded-md"></div>
              <div className="h-4 w-4/6 bg-gray-700 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="h-12 w-full bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;

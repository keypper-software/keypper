"use client";
import { useState } from "react";
import { ChevronDown, Calendar } from "lucide-react";
import { MOCK_ACTIVITIES } from "@/constants/activities";
import ActivityCard from "@/components/interface/activity-card";
function Page() {
  const [showAllActivity, setShowAllActivity] = useState(true);
  return (
    <div className="rounded-lg mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">Activity Log</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Show all activity</span>
          <div
            className={`w-10 h-5 rounded-full p-0.5 cursor-pointer ${showAllActivity ? "bg-accent" : "bg-gray-300"}`}
            onClick={() => setShowAllActivity(!showAllActivity)}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-sm transform duration-300 ease-in-out ${showAllActivity ? "translate-x-5" : ""}`}
            ></div>
          </div>
          <button className="text-gray-400">
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_ACTIVITIES.map((activity, index) => {
          return (
            <div className="space-y-4 border-l px-2">
              <ActivityCard activity={activity} key={index} />

              <div className="relative space-y-4">
                {activity?.children
                  ?.slice(0, showAllActivity ? activity.children.length : 2)
                  .map((subActivitity, i) => {
                    return (
                      <ActivityCard.Inner
                        key={i}
                        subActivitity={subActivitity}
                      />
                    );
                  })}
                {!showAllActivity && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(0deg, #121214, transparent)`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Page;

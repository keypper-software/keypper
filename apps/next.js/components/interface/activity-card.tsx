import { Activity } from "@/constants/activities";
import {
  getActivityIconBg,
  getActivitytIcon,
} from "@/lib/get-activity-event-types";
import { cn } from "@/lib/utils";
import React from "react";

interface ActivityCard {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCard) => {
  return (
    <div className="flex">
      <div className="mr-3 mt-1">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center",
            getActivityIconBg(activity.event)
          )}
        >
          {/* {getActivityIconBg(activity.event)} */}
          {getActivitytIcon(activity.event)}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{activity.user.name}</span>
          <span className="text-gray-500 text-sm">{activity.event}</span>
          <span className="text-gray-500 text-sm">• {activity.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

const ActivityCardInner = ({ subActivitity }: { subActivitity: Activity }) => {
  return (
    <div className="ml-8 pl-2 border-l flex">
      <div className="mr-3 mt-1">
        <div
          className={cn(
            "w-6 h-6 bg-accent/40 rounded-full flex items-center justify-center text-accent",
            getActivityIconBg(subActivitity.event)
          )}
        >
          {getActivitytIcon(subActivitity.event)}
        </div>
      </div>
      <div className="flex-1">
        <div className=" p-3 rounded-md border border-gray-50/10">
          <h3 className="font-medium">{subActivitity.event}</h3>
          <div className="text-sm text-gray-500 mb-2">
            {subActivitity.location} • {subActivitity.ip} •{" "}
            {subActivitity.platform}
          </div>

          <div className=""></div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-pink-400 border-2 border-white flex items-center justify-center text-white text-xs">
                {subActivitity.user.avatar}
              </div>
            </div>
            <span className="text-xs text-gray-500">{subActivitity.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

ActivityCard.Inner = ActivityCardInner;

export default ActivityCard;

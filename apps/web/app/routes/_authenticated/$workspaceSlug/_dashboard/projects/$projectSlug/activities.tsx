import { createFileRoute } from '@tanstack/react-router'
import { ArrowDown } from 'lucide-react'
import { Fragment, useState } from 'react'

interface Activity {
  id: string
  user: {
    name: string
    email: string
    avatar: string
  }
  event: string
  platform: string
  time: string
  project: string
  environment: string
  timestamp: string
  location: string
  ip: string
}

const mockActivities: Activity[] = [
  {
    id: '1',
    user: {
      name: 'akinkunmioye42',
      email: 'akinkunmioye42@gmail.com',
      avatar: 'A',
    },
    event: '2 Secret(s) Pulled',
    platform: 'APP',
    time: '1 day ago',
    project: "xing's-project",
    environment: 'development',
    timestamp: 'Jan 06, 2025, 18:27:42',
    location: 'Not available',
    ip: '105.119.18.70',
  },
  {
    id: '2',
    user: {
      name: 'sarahsmith',
      email: 'sarah.smith@company.com',
      avatar: 'S',
    },
    event: 'Environment Created',
    platform: 'CLI',
    time: '2 days ago',
    project: 'mobile-app',
    environment: 'staging',
    timestamp: 'Jan 05, 2025, 14:15:22',
    location: 'San Francisco, US',
    ip: '192.168.1.100',
  },
  {
    id: '3',
    user: {
      name: 'davidchen',
      email: 'david.chen@company.com',
      avatar: 'D',
    },
    event: '5 Secret(s) Updated',
    platform: 'WEB',
    time: '3 days ago',
    project: 'backend-api',
    environment: 'production',
    timestamp: 'Jan 04, 2025, 09:45:11',
    location: 'Singapore',
    ip: '172.16.0.100',
  },
  {
    id: '4',
    user: {
      name: 'mariagomez',
      email: 'maria.gomez@company.com',
      avatar: 'M',
    },
    event: 'Project Created',
    platform: 'APP',
    time: '4 days ago',
    project: 'data-pipeline',
    environment: 'development',
    timestamp: 'Jan 03, 2025, 16:33:45',
    location: 'Madrid, Spain',
    ip: '10.0.0.50',
  },
  {
    id: '5',
    user: {
      name: 'jameswilson',
      email: 'james.wilson@company.com',
      avatar: 'J',
    },
    event: '3 Secret(s) Deleted',
    platform: 'CLI',
    time: '5 days ago',
    project: 'frontend-app',
    environment: 'staging',
    timestamp: 'Jan 02, 2025, 11:22:33',
    location: 'London, UK',
    ip: '192.168.2.200',
  },
  {
    id: '6',
    user: {
      name: 'emilyjohnson',
      email: 'emily.johnson@company.com',
      avatar: 'E',
    },
    event: 'Environment Deleted',
    platform: 'WEB',
    time: '6 days ago',
    project: 'analytics-service',
    environment: 'production',
    timestamp: 'Jan 01, 2025, 08:12:55',
    location: 'Sydney, Australia',
    ip: '172.16.1.150',
  },
]

function RouteComponent() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="px-6 py-4">
      <table className="w-full">
        <thead>
          <tr className="text-sm text-gray-500 text-left">
            <th className="pb-4">USER</th>
            <th className="pb-4">EVENT</th>
            <th className="pb-4">PLATFORM</th>
            <th className="pb-4">TIME</th>
          </tr>
        </thead>
        <tbody>
          {mockActivities.map((activity) => (
            <Fragment key={activity.id}>
              <tr
                className="group cursor-pointer bg-white/10 hover:bg-white/20 transition-all duration-300 my-3"
                onClick={() =>
                  setExpandedId(expandedId === activity.id ? null : activity.id)
                }
              >
                <td className="py-2 rounded-tl-lg rounded-bl-lg">
                  <div className="flex items-center gap-2">
                    <ArrowDown
                      className={`w-4 h-4 transition-transform ${
                        expandedId === activity.id ? 'rotate-180' : ''
                      }`}
                    />
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                      {activity.user.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{activity.user.name}</div>
                      <div className="text-sm text-gray-500">
                        {activity.user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2">{activity.event}</td>
                <td className="py-2">{activity.platform}</td>
                <td className="py-2 flex items-center gap-2 rounded-tr-lg rounded-br-lg">
                  {activity.time}
                </td>
              </tr>
              {expandedId === activity.id && (
                <tr>
                  <td colSpan={4} className="px-4 py-3">
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-gray-500">Project: </span>
                        <span>{activity.project}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Environment: </span>
                        <span>{activity.environment}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Time: </span>
                        <span>{activity.timestamp}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Location: </span>
                        <span>{activity.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">IP: </span>
                        <span>{activity.ip}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const Route = createFileRoute(
  '/_authenticated/$workspaceSlug/_dashboard/projects/$projectSlug/activities',
)({
  component: RouteComponent,
})

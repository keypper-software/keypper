import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/$workspaceSlug/_dashboard/projects/$projectSlug/compare',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      Hello
      "/_authenticated/workspace/$workspaceSlug/projects/$projectSlug/compare"!
    </div>
  )
}

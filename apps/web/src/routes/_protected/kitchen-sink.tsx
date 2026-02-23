import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/kitchen-sink')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/kitchen-sink"!</div>
}

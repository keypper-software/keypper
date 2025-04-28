import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
} from "@tanstack/react-router";
import { Meta, Scripts } from "@tanstack/react-start";
import type { ReactNode } from "react";
import appStyles from "~/styles/app.css?url";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { APP_NAME } from "~/lib/constants";
import { fetchAuth } from "~/lib/auth-fetch";
import { db } from "~/db";
import { eq, and } from "drizzle-orm";
import { member, organization, project } from "~/db/schema";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: APP_NAME,
      },
    ],
    links: [{ rel: "stylesheet", href: appStyles }],
  }),
  component: RootComponent,
  beforeLoad: async () => {
    const { userId, organization } = await fetchAuth();
    return {
      userId,
      organization,
    };
  },
});

function RootComponent() {
  return (
    <RootDocument>
      <Toaster richColors />
      <QueryClientProvider client={queryClient}>
        <Outlet />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <Meta />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

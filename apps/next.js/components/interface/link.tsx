import NextLink from "next/link";
import { ComponentProps } from "react";

export type AppRoute =
  | "/"
  | "/pricing"
  | "/docs"
  | "/login"
  | "/signup"
  | "/$workspaceSlug"
  | "/$workspaceSlug/welcome"
  | "/$workspaceSlug/getting-started"
  | "/$workspaceSlug/projects"
  | "/$workspaceSlug/projects/$projectSlug"
  | "/$workspaceSlug/projects/$projectSlug/activities"
  | "/$workspaceSlug/projects/$projectSlug/compare"
  | "/$workspaceSlug/projects/$projectSlug/people";

type RouteParams<T extends AppRoute> = T extends "/$workspaceSlug"
  ? { workspaceSlug: string }
  : T extends "/$workspaceSlug/welcome"
    ? { workspaceSlug: string }
    : T extends "/$workspaceSlug/getting-started"
      ? { workspaceSlug: string }
      : T extends "/$workspaceSlug/projects"
        ? { workspaceSlug: string }
        : T extends "/$workspaceSlug/projects/$projectSlug"
          ? { workspaceSlug: string; projectSlug: string }
          : T extends "/$workspaceSlug/projects/$projectSlug/activities"
            ? { workspaceSlug: string; projectSlug: string }
            : T extends "/$workspaceSlug/projects/$projectSlug/compare"
              ? { workspaceSlug: string; projectSlug: string }
              : T extends "/$workspaceSlug/projects/$projectSlug/people"
                ? { workspaceSlug: string; projectSlug: string }
                : never;

type LinkProps<T extends AppRoute> = {
  to: T;
  params?: RouteParams<T>;
} & Omit<ComponentProps<typeof NextLink>, "href">;

export function Link<T extends AppRoute>({
  to,
  params,
  ...props
}: LinkProps<T>) {
  let href: AppRoute = to;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      href = href.replace(`$${key}`, value) as AppRoute;
    });
  }

  return <NextLink href={href} {...props} />;
}

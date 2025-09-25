export const data = [
  {
    filePath: ".gitignore",
    bugs: [
      {
        id: "fd3dbb571a12a1c3baf000db049e141c888d05a8_0",
        title: "Missing ignore for root .env file",
        description:
          "The .gitignore contains '.env*.local' but does not ignore a root '.env' file. Root environment files often contain secrets and could be committed if not ignored. Add a rule to ignore '.env' (and optionally other variants like '.env.*').",
        lines: [29, 29],
      },
    ],
    id: "fd3dbb571a12a1c3baf000db049e141c888d05a8",
  },
  {
    filePath: "app/(auth)/sign-in/[[...sign-in]]/page.tsx",
    bugs: [
      {
        id: "2cc13d4c9b7a61e7fb15113e46e16aa9ee49c652_0",
        title:
          "Server component rendering a Clerk client component without 'use client' directive",
        description:
          "In Next.js App Router, the page.tsx file is a server component by default. It imports and renders Clerk's SignIn component, which is a client component. Rendering a client component from a server component without marking the file as a client component will fail to compile/execute. Add a 'use client' directive at the top of the file or refactor to a dedicated client wrapper, and ensure ClerkProvider is configured in the layout.",
        lines: [1, 5],
      },
    ],
    id: "2cc13d4c9b7a61e7fb15113e46e16aa9ee49c652",
  },
  {
    filePath: "app/(root)/events/[id]/page.tsx",
    bugs: [
      {
        id: "0036930c96ffb58ce30f633a5642bf58ba8a85e2_0",
        title: "Unvalidated event data can crash server component",
        description:
          "If getEventById(id) returns null/undefined (e.g., invalid or missing event), subsequent access to event properties (such as event.category) will throw a runtime error, crashing the server component.",
        lines: [18, 18],
      },
      {
        id: "0036930c96ffb58ce30f633a5642bf58ba8a85e2_1",
        title: "PII exposure: Displaying organizer's full name",
        description:
          "The page renders event.organizer.firstName and event.organizer.lastName, which may reveal personal data (PII) to the public. Ensure this aligns with privacy requirements and consent.",
        lines: [52, 53],
      },
      {
        id: "0036930c96ffb58ce30f633a5642bf58ba8a85e2_2",
        title: "SSRF risk: External image URL used in Next/Image",
        description:
          "Event image URL (event.imageUrl) is supplied directly to Next/Image. If this value is user-controlled, it can trigger server-side requests to arbitrary hosts or internal resources. Validate/sanitize image URLs or restrict allowed domains.",
        lines: [28, 33],
      },
      {
        id: "0036930c96ffb58ce30f633a5642bf58ba8a85e2_3",
        title: "Unvalidated 'page' parameter used for related events fetch",
        description:
          "The page parameter from searchParams is passed directly into getRelatedEventsByCategory (as a string) without validation. This could lead to unexpected backend behavior or errors if non-numeric or out-of-range values are provided.",
        lines: [20, 20],
      },
      {
        id: "0036930c96ffb58ce30f633a5642bf58ba8a85e2_4",
        title: "Unvalidated 'page' parameter used for UI pagination",
        description:
          "The same page parameter is forwarded to the Collection component for pagination without validation, which could cause incorrect paging or runtime issues in the UI.",
        lines: [112, 112],
      },
    ],
    id: "0036930c96ffb58ce30f633a5642bf58ba8a85e2",
  },
];

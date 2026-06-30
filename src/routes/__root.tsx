import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-white">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-zinc-200">Faqja nuk u gjet</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Kjo faqe nuk ekziston ose është zhvendosur në një link tjetër.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400"
          >
            Kthehu në Ballinë
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Faqja nuk u ngarkua dot
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Ndodhi një gabim gjatë leximit të rrugëve të router-it. Ju lutemi pastroni faqen.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-400"
          >
            Provo përsëri
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Kthehu në Ballinë
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Vogue Cutts" },
      { name: "description", content: "Vogue Cutts Admin Dashboard" },
      { name: "author", content: "Trisoft AI" },
      { property: "og:title", content: "Vogue Cutts" },
      { property: "og:description", content: "Vogue Cutts Admin Dashboard" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="sq">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  const [showClosedLabel, setShowClosedLabel] = useState(false);
  const [closedMessage, setClosedMessage] = useState("");

  // Heartbeat per te mbajtur Supabase active
  useEffect(() => {
    const keepAlive = async () => {
      try {
        await supabase.from("profiles").select("id").limit(1);
      } catch (error) {
        console.error("Heartbeat error:", error);
      }
    };

    const interval = setInterval(keepAlive, 600000); // 10 min
    return () => clearInterval(interval);
  }, []);

  // Check today's opening hours and show temporary label if closed
  useEffect(() => {
    const checkToday = async () => {
      try {
        const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const today = new Date();
        const dayName = weekdays[today.getDay()];

        const { data, error } = await supabase
          .from("opening_hours")
          .select("is_closed, open_time, close_time")
          .eq("day_of_week", dayName)
          .maybeSingle();

        if (error) {
          // silent
          return;
        }

        if (data?.is_closed) {
          setClosedMessage("We are closed today — you can still browse our website.");
          setShowClosedLabel(true);
          setTimeout(() => setShowClosedLabel(false), 2500);
        }
      } catch (err) {
        // ignore
      }
    };

    checkToday();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {showClosedLabel && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto rounded-lg bg-black/80 px-6 py-3 text-sm text-white shadow-lg backdrop-blur-sm">
            {closedMessage}
          </div>
        </div>
      )}
    </QueryClientProvider>
  );
}
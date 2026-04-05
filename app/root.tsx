import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useState, useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import type { Route } from "./+types/root";
import "./app.css";
import { Layout as AppLayout } from "./components/layout/Layout";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
  { rel: "icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", href: "/logo_sibsiu.png" },
];

// SEO: мета-теги по умолчанию
export const meta: Route.MetaFunction = () => [
  { title: "Столовая СибГИУ - Онлайн заказ еды" },
  { name: "description", content: "Система онлайн-заказов для столовой СибГИУ. Заказывайте любимые блюда заранее и экономьте время." },
  { name: "keywords", content: "столовая, сибгиу, еда, заказ, меню, новокузнецк" },
  { property: "og:title", content: "Столовая СибГИУ" },
  { property: "og:description", content: "Система онлайн-заказов для столовой СибГИУ" },
  { property: "og:type", content: "website" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Компонент для рендеринга только на клиенте (например, для Toaster)
function ClientOnly({ children }: { children: () => ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  return <>{children()}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ClientOnly>
          {() => <Toaster position="top-center" />}
        </ClientOnly>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </CartProvider>
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
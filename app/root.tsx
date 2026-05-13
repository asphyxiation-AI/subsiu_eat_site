import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "react-router";
import { useState, useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import type { Route } from "./+types/root";
import "./app.css";
import { Layout as AppLayout } from "./components/layout/Layout";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, type InitialAuthData } from "./context/AuthContext";
import { ConfirmProvider } from "./components/ui/ConfirmModal";


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
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// SSR loader: декодируем JWT из cookie, чтобы передать авторизацию на клиент
// и избежать "мигания" неавторизованного состояния при гидратации
export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookies: Record<string, string> = {};
  
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.trim().split("=");
      if (parts.length >= 2) {
        cookies[parts[0]] = parts.slice(1).join("=");
      }
    });
  }

  const accessToken = cookies["access_token"];
  
  if (accessToken) {
    try {
      const base64Url = accessToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = Buffer.from(base64, "base64").toString("utf-8");
      const payload = JSON.parse(decoded);
      
      const auth: InitialAuthData = {
        isAuthenticated: true,
        accessToken,
        user: {
          id: payload.sub,
          username: payload.preferred_username || payload.email || payload.sub,
          email: payload.email || "",
          firstName: payload.given_name || "",
          lastName: payload.family_name || "",
          fullName: payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim() || payload.preferred_username,
          group: payload.group || payload.study_group || "",
          roles: payload.realm_access?.roles || [],
        },
      };
      return { auth };
    } catch (e) {
      console.error("Failed to decode token in root loader:", e);
    }
  }
  
  return { auth: { isAuthenticated: false, user: null, accessToken: null } as InitialAuthData };
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
  const { auth } = useLoaderData<typeof loader>();
  const location = useLocation();
  
  useEffect(() => {
    // При переходе между страницами всегда скроллим вверх
    window.scrollTo({ 
      top: 0, 
      behavior: 'instant' 
    });
  }, [location.pathname]);

  return (
    <AuthProvider initialAuth={auth}>
      <CartProvider>
        <ConfirmProvider>
          <Toaster 
            position="top-right" 
            offset={90} 
            closeButton
            duration={2200}
            toastOptions={{
              className: '!bg-white !rounded-2xl !shadow-xl !border !border-gray-100 !p-4 !pr-12 !min-w-[320px]',
              classNames: {
                title: '!text-gray-900 !font-bold !text-base',
                description: '!text-gray-600 !text-sm',
                closeButton: '!absolute !top-3 !right-3 !bg-gray-100 !hover:bg-gray-200 !text-gray-500 !rounded-xl !w-7 !h-7 !flex !items-center !justify-center',
                success: '!border-l-4 !border-l-emerald-500',
                error: '!border-l-4 !border-l-red-500',
                warning: '!border-l-4 !border-l-amber-500',
                info: '!border-l-4 !border-l-blue-500',
              },
              style: {
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
              }
            }}
          />
          <AppLayout>
            <Outlet />
          </AppLayout>
        </ConfirmProvider>
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
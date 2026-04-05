/**
 * API route для получения заказов пользователя
 */

import { prisma } from "../lib/db.server";

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.trim().split("=");
    if (parts.length >= 2) {
      cookies[parts[0]] = parts.slice(1).join("=");
    }
  });
  return cookies;
}

function decodeToken(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export async function loader({ request }: { request: Request }) {
  try {
    const cookieHeader = request.headers.get("Cookie");
    const cookies = parseCookies(cookieHeader);
    const accessToken = cookies["access_token"];

    if (!accessToken) {
      return Response.json({ error: "Не авторизован" }, { status: 401 });
    }

    const payload = decodeToken(accessToken);
    const userSub = payload?.sub;

    if (!userSub) {
      return Response.json({ orders: [] });
    }

    const orders = await prisma.order.findMany({
      where: { userSub },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: true,
      },
    });

    return Response.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return Response.json({ error: "Ошибка" }, { status: 500 });
  }
}

/**
 * API route для создания заказа
 */

import { prisma } from "../lib/db.server";

// Вспомогательная функция для парсинга куки
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

// Декодируем токен
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

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const cookieHeader = request.headers.get("Cookie");
    const cookies = parseCookies(cookieHeader);
    const accessToken = cookies["access_token"];

    if (!accessToken) {
      return Response.json({ error: "Не авторизован" }, { status: 401 });
    }

    const payload = decodeToken(accessToken);
    const userSub = payload?.sub || "anonymous";

    const { items, pickupTime, totalPrice } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Корзина пуста" }, { status: 400 });
    }

    if (!pickupTime) {
      return Response.json({ error: "Выберите время получения" }, { status: 400 });
    }

    // Создаём заказ
    const order = await prisma.order.create({
      data: {
        userSub,
        totalPrice: totalPrice || 0,
        pickupTime: new Date(`1970-01-01T${pickupTime}:00`),
        status: "PREPARING",
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    return Response.json({ success: true, orderId: order.id, status: order.status });
  } catch (error) {
    console.error("Order error:", error);
    return Response.json({ error: "Ошибка" }, { status: 500 });
  }
}

export function loader() {
  return Response.json({ error: "Not found" }, { status: 404 });
}

/**
 * API route для создания заказа с валидацией
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

// Валидация времени
function isValidPickupTime(time: string): boolean {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!regex.test(time)) return false;
  const hour = parseInt(time.split(":")[0], 10);
  return hour >= 8 && hour <= 18; // Рабочее время 8:00-18:00
}

// Валидация item заказа
function isValidOrderItem(item: any): boolean {
  return (
    typeof item === "object" &&
    typeof item.id === "string" &&
    item.id.length > 0 &&
    typeof item.name === "string" &&
    item.name.length > 0 &&
    typeof item.price === "number" &&
    item.price > 0 &&
    typeof item.quantity === "number" &&
    item.quantity > 0 &&
    item.quantity <= 100 // Ограничение на количество
  );
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

    // Проверка Content-Type
    const contentType = request.headers.get("Content-Type");
    if (!contentType?.includes("application/json")) {
      return Response.json({ error: "Неверный формат данных" }, { status: 400 });
    }

    const body = await request.json();
    const { items, pickupTime, totalPrice } = body;

    // Валидация items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: "Корзина пуста" }, { status: 400 });
    }

    if (items.length > 50) {
      return Response.json({ error: "Слишком много позиций в заказе" }, { status: 400 });
    }

    // Валидация каждого item
    for (const item of items) {
      if (!isValidOrderItem(item)) {
        return Response.json({ error: "Неверные данные товара" }, { status: 400 });
      }
    }

    // Валидация pickupTime
    if (!pickupTime || typeof pickupTime !== "string") {
      return Response.json({ error: "Выберите время получения" }, { status: 400 });
    }

    if (!isValidPickupTime(pickupTime)) {
      return Response.json({ error: "Неверное время получения (08:00-18:00)" }, { status: 400 });
    }

    // Валидация totalPrice
    if (typeof totalPrice !== "number" || totalPrice <= 0 || totalPrice > 100000) {
      return Response.json({ error: "Неверная сумма заказа" }, { status: 400 });
    }

    // Создаём заказ
    const order = await prisma.order.create({
      data: {
        userSub,
        totalPrice,
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

    return Response.json({ success: true, orderId: order.id, orderNumber: order.orderNumber, status: order.status });
  } catch (error) {
    console.error("Order error:", error);
    return Response.json({ error: "Ошибка при создании заказа" }, { status: 500 });
  }
}

export function loader() {
  return Response.json({ error: "Not found" }, { status: 404 });
}
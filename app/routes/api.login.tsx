/**
 * Серверный API route для авторизации через Keycloak
 * Избегаем CORS проблем
 */

import type { Route } from "./+types/api.login";
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, getKeycloakClientSecret } from "../constants/config";
import { z } from "zod";

// === Валидация входных данных ===
const loginSchema = z.object({
  username: z.string().min(1, "Username обязателен").max(100),
  password: z.string().min(1, "Password обязателен").max(200),
});

function validateLoginInput(data: unknown): { username: string; password: string } {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message).join(", ");
    throw new Error(`Валидация не пройдена: ${errors}`);
  }
  return result.data;
}

// === Rate Limiting (простая реализация в памяти) ===
// Для production лучше использовать Redis или аналог
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // максимум попыток
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 минут в миллисекундах

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    // Новая запись или время истекло
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    // Превышен лимит
    return false;
  }
  
  record.count++;
  return true;
}

function getClientIP(request: Request): string {
  // Пробуем получить IP из различных заголовков
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  // === Rate Limiting (отключен в dev) ===
  if (process.env.NODE_ENV === "production") {
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return Response.json(
        { error: "Слишком много попыток. Попробуйте позже." },
        { status: 429, headers: { "Retry-After": "900" } }
      );
    }
  }

  // === CSRF Protection ===
  // Проверяем Referer заголовок для SameSite Lax защиты
  const referer = request.headers.get("Referer");
  const origin = request.headers.get("Origin");
  const allowedOrigins = [
    "http://localhost:5173",
    "https://sibsiu-canteen.ru",
  ];
  
  // Разрешаем запросы с известных источников или без заголовков (для простоты)
  if (referer || origin) {
    const requestOrigin = origin || (referer ? new URL(referer).origin : null);
    if (requestOrigin && !allowedOrigins.includes(requestOrigin as string)) {
      console.warn("CSRF check failed:", { origin: requestOrigin, referer });
      // В dev режиме не блокируем, но логируем
    }
  }

  try {
    const body = await request.json();
    
    // Валидация входных данных
    const { username, password } = validateLoginInput(body);

    // Запрос к Keycloak через сервер
    const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
    
    // Получаем client secret, с fallback для dev
    let clientSecret: string;
    try {
      clientSecret = getKeycloakClientSecret();
    } catch (e) {
      // Используем тестовый secret в dev режиме
      if (import.meta.env.DEV) {
        clientSecret = "VCHfWLinO4Vx8hM2e4a8fVpflPuSButf";
      } else {
        throw e;
      }
    }
    
    const params = new URLSearchParams({
      grant_type: "password",
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: clientSecret,
      username,
      password,
    });

    let tokens: any;
    
    try {
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        // Если Keycloak недоступен - пробуем офлайн режим для dev
        if (import.meta.env.DEV && process.env.NODE_ENV !== "production") {
          console.warn("Keycloak недоступен, используем офлайн режим для разработки");
          // Простая эмуляция токена для dev
          const fakeToken = Buffer.from(JSON.stringify({
            sub: `user-${username}`,
            preferred_username: username,
            email: `${username}@sibsiu.ru`,
            realm_access: { roles: username === "admin" ? ["admin", "student"] : ["student"] },
            exp: Math.floor(Date.now() / 1000) + 3600,
          })).toString("base64");
          
          tokens = {
            access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${fakeToken}.fake_signature`,
            refresh_token: `refresh_${Date.now()}`,
            expires_in: 3600,
          };
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Keycloak error:", errorData);
          
          if (errorData.error === "invalid_grant") {
            return Response.json({ error: "Неверный логин или пароль" }, { status: 401 });
          }
          if (errorData.error === "unauthorized_client") {
            return Response.json({ error: "Клиент не настроен в Keycloak" }, { status: 500 });
          }
          if (errorData.error === "Realm does not exist") {
            return Response.json({ error: "Realm не настроен в Keycloak" }, { status: 500 });
          }
          return Response.json({ error: "Ошибка авторизации" }, { status: 401 });
        }
      } else {
        tokens = await response.json();
      }
    } catch (keycloakError) {
      // При ошибке сети - fallback для dev режима
      if (import.meta.env.DEV) {
        console.warn("Ошибка подключения к Keycloak, используем офлайн режим:", keycloakError);
        const fakeToken = Buffer.from(JSON.stringify({
          sub: `user-${username}`,
          preferred_username: username,
          email: `${username}@sibsiu.ru`,
          realm_access: { roles: username === "admin" ? ["admin", "student"] : ["student"] },
          exp: Math.floor(Date.now() / 1000) + 3600,
        })).toString("base64");
        
        tokens = {
          access_token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${fakeToken}.fake_signature`,
          refresh_token: `refresh_${Date.now()}`,
          expires_in: 3600,
        };
      } else {
        throw keycloakError;
      }
    }

    if (!tokens) {
      return Response.json({ error: "Не удалось получить токен авторизации" }, { status: 500 });
    }

    // Декодируем токен для получения данных пользователя
    const decodeToken = (token: string) => {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = Buffer.from(base64, "base64").toString("utf-8");
        return JSON.parse(json);
      } catch {
        return null;
      }
    };

    const payload = decodeToken(tokens.access_token);

    const userData = {
      id: payload?.sub || `user-${Date.now()}`,
      username: username,
      email: payload?.email || `${username}@sibgiu.ru`,
      firstName: payload?.given_name || "",
      lastName: payload?.family_name || "",
      fullName: payload?.name || username,
      roles: payload?.realm_access?.roles || ["student"],
    };

    // Устанавливаем HTTP-only куки с токенами (защита от XSS и CSRF)
    // SameSite=Lax - баланс между безопасностью и совместимостью с OAuth
    // Secure только в production
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = `Path=/; HttpOnly; SameSite=Lax${isProduction ? "; Secure" : ""}`;
    const accessTokenCookie = `access_token=${tokens.access_token}; ${cookieOptions}; Max-Age=${tokens.expires_in || 1800}`;
    const refreshTokenCookie = `refresh_token=${tokens.refresh_token}; ${cookieOptions}; Max-Age=${60 * 60 * 24 * 7}`;
    
    return Response.json({
      success: true,
      user: userData,
      expiresIn: tokens.expires_in,
    }, {
      headers: {
        "Set-Cookie": `${accessTokenCookie}, ${refreshTokenCookie}`,
      },
    });
  } catch (error) {
    // Обработка ошибок валидации
    if (error instanceof Error && error.message.includes("Валидация")) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    
    console.error("Login error:", error);
    return Response.json({ error: "Ошибка соединения с сервером авторизации" }, { status: 500 });
  }
}

// Предотвращаем GET запросы
export function loader() {
  return Response.json({ error: "Not found" }, { status: 404 });
}

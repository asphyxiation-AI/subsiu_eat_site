/**
 * Серверный API route для авторизации через Keycloak
 * Избегаем CORS проблем
 */

import type { Route } from "./+types/api.login";
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET } from "../constants/config";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json({ error: "Missing credentials" }, { status: 400 });
    }

    // Запрос к Keycloak через сервер
    const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
    
    const params = new URLSearchParams({
      grant_type: "password",
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      username,
      password,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Keycloak error:", errorData);
      
      if (errorData.error === "invalid_grant") {
        return Response.json({ error: "Неверный логин или пароль" }, { status: 401 });
      }
      if (errorData.error === "unauthorized_client") {
        return Response.json({ error: "Клиент не настроен в Keycloak" }, { status: 500 });
      }
      return Response.json({ error: "Ошибка авторизации" }, { status: 401 });
    }

    const tokens = await response.json();

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

    return Response.json({
      success: true,
      user: userData,
      accessToken: tokens.access_token,
      expiresIn: tokens.expires_in,
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Ошибка соединения с сервером авторизации" }, { status: 500 });
  }
}

// Предотвращаем GET запросы
export function loader() {
  return Response.json({ error: "Not found" }, { status: 404 });
}

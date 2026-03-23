import { data } from "react-router";
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET } from "../constants/config";

// Вспомогательная функция для парсинга куки
function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieHeader) return cookies;
  
  // Разделяем по ; и затем по =
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.trim().split("=");
    if (parts.length >= 2) {
      const name = parts[0];
      const value = parts.slice(1).join("="); // Для случаев когда в значении есть =
      cookies[name] = value;
    }
  });
  
  return cookies;
}

// Вспомогательная функция для декодирования JWT токена
function decodeJWT(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    // Декодируем payload (вторая часть)
    const payload = parts[1];
    // Добавляем padding если нужно
    const padded = payload + "=".repeat((4 - payload.length % 4) % 4);
    const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (e) {
    console.error("JWT decode error:", e);
    return null;
  }
}

export async function loader({ request }: { request: Request }) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const accessToken = cookies["access_token"];

  if (!accessToken) {
    return data({ authenticated: false, user: null }, { status: 401 });
  }

  // Декодируем токен
  const payload = decodeJWT(accessToken);
  
  if (!payload) {
    return data({ authenticated: false, user: null }, { status: 401 });
  }
  
  // Проверяем срок действия токена
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    // Токен истёк - пробуем обновить
    const refreshToken = cookies["refresh_token"];
    if (refreshToken) {
      try {
        const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
        const refreshResponse = await fetch(tokenUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: KEYCLOAK_CLIENT_ID,
            client_secret: KEYCLOAK_CLIENT_SECRET,
            refresh_token: refreshToken,
          }),
        });

        if (refreshResponse.ok) {
          const tokens = await refreshResponse.json();
          const newAccessToken = tokens.access_token;
          const newRefreshToken = tokens.refresh_token;
          const expiresIn = tokens.expires_in || 300;

          return data(
            {
              authenticated: true,
              user: {
                id: payload.sub,
                username: payload.preferred_username || payload.email,
                email: payload.email,
                firstName: payload.given_name || "",
                lastName: payload.family_name || "",
                fullName: payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim(),
                group: payload.group || payload.study_group || "",
                roles: payload.realm_access?.roles || [],
              },
            },
            {
              headers: {
                "Set-Cookie": [
                  `access_token=${newAccessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${expiresIn}`,
                  `refresh_token=${newRefreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
                ].join(", "),
              },
            }
          );
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }
    }
    
    return data({ authenticated: false, user: null }, { status: 401 });
  }

  // Токен валиден
  return data({
    authenticated: true,
    user: {
      id: payload.sub,
      username: payload.preferred_username || payload.email,
      email: payload.email,
      firstName: payload.given_name || "",
      lastName: payload.family_name || "",
      fullName: payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim(),
      group: payload.group || payload.study_group || "",
      roles: payload.realm_access?.roles || [],
    },
  });
}

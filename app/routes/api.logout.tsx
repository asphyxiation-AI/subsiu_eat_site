import { data, redirect } from "react-router";

export async function action({ request }: { request: Request }) {
  // Получаем refresh token из cookie для отзыва в Keycloak
  const cookieHeader = request.headers.get("Cookie");
  const cookies: Record<string, string> = {};
  
  if (cookieHeader) {
    cookieHeader.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        cookies[name] = value;
      }
    });
  }

  const refreshToken = cookies["refresh_token"];
  
  // Пытаемся отозвать токен в Keycloak (опционально)
  if (refreshToken) {
    try {
      const keycloakUrl = cookies["keycloak_url"];
      const keycloakRealm = cookies["keycloak_realm"];
      
      if (keycloakUrl && keycloakRealm) {
        await fetch(`${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: cookies["client_id"] || "",
            refresh_token: refreshToken,
          }),
        });
      }
    } catch (error) {
      console.error("Keycloak logout failed:", error);
    }
  }

  // Очищаем cookies
  return data(
    { success: true },
    {
      headers: {
        "Set-Cookie": [
          "access_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
          "refresh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
        ].join(", "),
      },
    }
  );
}

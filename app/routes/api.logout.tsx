import { data, redirect } from "react-router";
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from "../constants/config";
import { getKeycloakClientSecret } from "../constants/config";

export async function action({ request }: { request: Request }) {
  // Получаем refresh token из cookie
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

  const refreshToken = cookies["refresh_token"];
  
  // Пытаемся отозвать токен в Keycloak
  if (refreshToken) {
    try {
      const clientSecret = getKeycloakClientSecret();
      await fetch(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: KEYCLOAK_CLIENT_ID,
          client_secret: clientSecret,
          refresh_token: refreshToken,
        }),
      });
    } catch (error) {
      console.warn("Keycloak logout warning:", error);
    }
  }

  // Secure только в production
  const isProduction = process.env.NODE_ENV === "production";
  const cookieBase = `Path=/; HttpOnly; SameSite=Lax${isProduction ? "; Secure" : ""}`;

  // Очищаем cookies и редиректим на главную
  return redirect("/", {
    headers: {
      "Set-Cookie": [
        `access_token=; ${cookieBase}; Max-Age=0`,
        `refresh_token=; ${cookieBase}; Max-Age=0`,
      ].join(", "),
    },
  });
}

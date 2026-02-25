import { redirect } from "react-router";
import type { Route } from "./+types/auth-callback";
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from "../constants/config";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    console.error("Auth error:", error);
    return redirect("/login?error=auth_failed");
  }

  if (!code) {
    return redirect("/login");
  }

  try {
    // Обмен кода на токены
    const tokenUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
    
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: KEYCLOAK_CLIENT_ID,
        code: code,
        redirect_uri: `${url.origin}/auth/callback`,
      }),
    });

    if (!response.ok) {
      console.error("Token exchange failed:", await response.text());
      return redirect("/login?error=token_failed");
    }

    const tokens = await response.json();

    // Сохраняем токены в cookies или возвращаем на клиент
    // Для простоты - редирект на профиль с токеном в URL (в реальном проекте использовать cookies)
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    // Сохраняем в localStorage через URL
    return redirect(`/profile?token=${accessToken.substring(0, 50)}`);
  } catch (err) {
    console.error("Auth callback error:", err);
    return redirect("/login?error=callback_failed");
  }
}

export default function AuthCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#0066CC] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Выполняется вход...</p>
      </div>
    </div>
  );
}

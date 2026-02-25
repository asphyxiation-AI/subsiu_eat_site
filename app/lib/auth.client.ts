import Keycloak from "keycloak-js";
import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, APP_URL } from "../constants/config";

// Динамическое определение URL приложения - вызывается каждый раз при использовании
const getAppUrl = (): string => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return APP_URL;
};

// Очистка старых данных при инициализации (только на клиенте)
if (typeof window !== "undefined") {
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log("Local storage and session storage cleared");
  } catch (e) {
    console.error("Failed to clear storage:", e);
  }
}

// Флаг инициализации
let isInitialized = false;

// Экземпляр Keycloak создаётся с проверкой на SSR
let keycloak: Keycloak | null = null;

function getKeycloakInstance(): Keycloak {
  if (!keycloak) {
    console.log("Creating new Keycloak instance...");
    keycloak = new Keycloak({
      url: KEYCLOAK_URL,
      realm: KEYCLOAK_REALM,
      clientId: KEYCLOAK_CLIENT_ID,
    });
    
    // Логируем конфигурацию
    console.log("Keycloak config:", {
      url: KEYCLOAK_URL,
      realm: KEYCLOAK_REALM,
      clientId: KEYCLOAK_CLIENT_ID,
      redirectUri: getAppUrl(),
    });
  }
  return keycloak;
}

// Функция инициализации Keycloak
export async function initKeycloak(): Promise<Keycloak> {
  if (isInitialized) {
    console.log("Keycloak already initialized");
    return getKeycloakInstance();
  }

  // Проверка на SSR
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cannot initialize Keycloak on server"));
  }

  const kc = getKeycloakInstance();

  try {
    await kc.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri: `${getAppUrl()}/silent-check-sso.html`,
      pkceMethod: "S256",
      flow: "standard",
      responseMode: "fragment",
      checkLoginIframe: false,
      enableLogging: true,
    });

    isInitialized = true;
    console.log("Keycloak initialized successfully");
    console.log("Is authenticated:", kc.authenticated);
    console.log("Current Keycloak Flow:", kc.flow);

    if (kc.authenticated) {
      console.log("User is authenticated, loading profile...");
    }

    return kc;
  } catch (error) {
    console.error("Keycloak init error:", error);
    isInitialized = false;
    throw error;
  }
}

// Функция входа - форсированный редирект
export async function loginKeycloak(): Promise<void> {
  const kc = getKeycloakInstance();
  
  console.log("Login function triggered. Keycloak object:", kc);
  console.log("Is authenticated:", kc.authenticated);
  console.log("Current Keycloak Flow:", kc.flow);

  // Если уже авторизован - сразу на профиль
  if (kc.authenticated) {
    console.log("Already authenticated, redirecting to profile...");
    window.location.href = "/profile";
    return;
  }

  // Если не инициализирован - инициализируем
  if (!isInitialized) {
    console.log("Keycloak not initialized, initializing now...");
    try {
      await initKeycloak();
    } catch (error) {
      console.error("Failed to initialize Keycloak:", error);
    }
  }

  // Форсированный вызов login с пустым объектом
  console.log("Calling keycloak.login()...");
  try {
    await kc.login({});
  } catch (error) {
    console.error("Login error:", error);
    // Фоллбек - прямой редирект
    const appUrl = getAppUrl();
    const loginUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${KEYCLOAK_CLIENT_ID}&redirect_uri=${encodeURIComponent(appUrl)}&response_type=code&scope=openid`;
    console.log("Fallback login URL:", loginUrl);
    window.location.href = loginUrl;
  }
}

// Функция logout
export async function logoutKeycloak(): Promise<void> {
  const kc = getKeycloakInstance();
  await kc.logout({
    redirectUri: getAppUrl(),
  });
}

// Получение экземпляра Keycloak
export function getKeycloak(): Keycloak {
  return getKeycloakInstance();
}

// Тип для данных пользователя
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  group?: string;
  roles: string[];
}

// Функция для получения профиля пользователя из токена
export function getUserProfile(token: string): UserProfile | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    
    const firstName = payload.given_name || payload.name?.split(" ")[0] || "";
    const lastName = payload.family_name || payload.name?.split(" ")[1] || "";
    
    return {
      id: payload.sub,
      username: payload.preferred_username || payload.email,
      email: payload.email,
      firstName,
      lastName,
      fullName: payload.name || `${firstName} ${lastName}`.trim(),
      group: payload.group || payload.study_group || "",
      roles: payload.realm_access?.roles || [],
    };
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
  }
}

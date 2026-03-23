import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("cart", "routes/cart.tsx"),
  route("profile", "routes/profile.tsx"),
  route("login", "routes/login.tsx"),
  route("auth/callback", "routes/auth-callback.tsx"),
  route("admin", "routes/admin._index.tsx"),
  route("admin/orders", "routes/admin.orders.tsx"),
  route("admin/menu", "routes/admin.menu.tsx"),
  route("api/check-auth", "routes/api.check-auth.tsx"),
  route("api/logout", "routes/api.logout.tsx"),
  route("api/login", "routes/api.login.tsx"),
  route("*", "routes/.404.tsx"),
] satisfies RouteConfig;

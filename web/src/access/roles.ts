type AnyUser = {
  id?: number | string;
  role?: string | null;
  email?: string | null;
  name?: string | null;
} | null | undefined;

export function isAdmin(user: AnyUser): boolean {
  return Boolean(user && user.role === "admin");
}

export function isManager(user: AnyUser): boolean {
  return Boolean(user && user.role === "manager");
}

export function isStaff(user: AnyUser): boolean {
  return Boolean(user && (user.role === "admin" || user.role === "manager"));
}

/** Скрыть коллекцию/глобал в меню для менеджера CRM. */
export function hideFromManager(user: AnyUser): boolean {
  return isManager(user);
}

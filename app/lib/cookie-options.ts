export function secureCookiesEnabled() {
  const configured = process.env.COOKIE_SECURE?.trim().toLowerCase();

  if (configured === "false" || configured === "0" || configured === "no" || configured === "off") {
    return false;
  }

  if (configured === "true" || configured === "1" || configured === "yes" || configured === "on") {
    return true;
  }

  return process.env.NODE_ENV === "production";
}

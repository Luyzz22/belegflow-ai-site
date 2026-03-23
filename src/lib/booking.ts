const rawBookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL?.trim();

export const bookingLink = rawBookingUrl && /^https?:\/\//.test(rawBookingUrl) ? rawBookingUrl : null;

export function getBookingCta() {
  if (bookingLink) {
    return {
      href: bookingLink,
      label: "Produktgespräch vereinbaren",
      external: true,
      source: "configured_booking_link" as const,
    };
  }

  return {
    href: "/demo",
    label: "Demo anfragen",
    external: false,
    source: "demo_fallback" as const,
  };
}

import { getCurrentTenant } from "@/lib/auth/session";
import { getBookings, getBookingStats } from "@/features/bookings";
import { getRecoveryServices } from "@/features/recovery";
import { getClients } from "@/features/clients";
import { redirect } from "next/navigation";
import { BookingsClient } from "./_components/bookings-client";

export default async function BookingsPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/register");

  const [bookings, stats, services, clients] = await Promise.all([
    getBookings(tenant.id),
    getBookingStats(tenant.id),
    getRecoveryServices(tenant.id),
    getClients(tenant.id),
  ]);

  const serializedBookings = bookings.map((b) => ({
    ...b,
    price: Number(b.price),
  }));

  const serializedServices = services.map((s) => ({
    ...s,
    price: Number(s.price),
  }));

  return (
    <BookingsClient
      bookings={serializedBookings}
      stats={stats}
      services={serializedServices}
      clients={clients}
      tenantId={tenant.id}
    />
  );
}

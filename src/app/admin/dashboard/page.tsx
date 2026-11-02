import { redirect } from "next/navigation";
import { hasRole } from "@/lib/auth";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Server-side guard: the dashboard is never rendered without a valid admin session
  if (!(await hasRole("admin"))) {
    redirect("/admin");
  }
  return <AdminDashboard />;
}

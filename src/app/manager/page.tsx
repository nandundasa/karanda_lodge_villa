import { redirect } from "next/navigation";
import { hasRole } from "@/lib/auth";
import ManagerDashboard from "./ManagerDashboard";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
  // Server-side guard: the dashboard is never rendered without a valid session
  if (!(await hasRole("manager"))) {
    redirect("/manager/login");
  }
  return <ManagerDashboard />;
}

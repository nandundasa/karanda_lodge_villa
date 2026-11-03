import LoginCard from "../components/ui/LoginCard";

export default function AdminLogin() {
  return (
    <LoginCard
      role="Admin"
      endpoint="/api/admin/login"
      redirectTo="/admin/dashboard"
      subtitle="Manage rooms, prices, availability and photos."
    />
  );
}

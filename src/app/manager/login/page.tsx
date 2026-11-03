import LoginCard from "../../components/ui/LoginCard";

export default function ManagerLogin() {
  return (
    <LoginCard
      role="Manager"
      endpoint="/api/manager/login"
      redirectTo="/manager"
      subtitle="View bookings and add guest ID photos."
    />
  );
}

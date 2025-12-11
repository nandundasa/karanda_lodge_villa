"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./admin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      sessionStorage.setItem("adminAuth", "true");
      router.push("/admin/dashboard");
    } else {
      alert("Invalid password");
    }
  };

  return (
    <div className="admin-login">
      <form onSubmit={handleLogin} className="login-form">
        <h1>Admin Login</h1>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

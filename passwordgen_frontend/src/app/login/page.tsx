"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    secretKey: "",
  });
  const [message, setMessage] = useState("");

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle login submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        form
      );

      // ✅ Backend should return: { message: "Login successful", userId: "abc123" }
      const { message: successMsg, userId } = res.data;

      // ✅ Store userId in sessionStorage
      sessionStorage.setItem("userId", userId);

      setMessage(`✅ ${successMsg}`);

      // Clear form
      setForm({ email: "", password: "", secretKey: "" });

      // ✅ Redirect to /home/:userId
      setTimeout(() => router.push(`/home/${userId}`), 1000);
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || "Login failed"}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-96">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="secretKey"
            type="text"
            placeholder="Secret Key"
            value={form.secretKey}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
          >
            Login
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center font-medium">
            {message.startsWith("✅") ? (
              <span className="text-green-600">{message}</span>
            ) : (
              <span className="text-red-600">{message}</span>
            )}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Do not have an account?{" "}
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

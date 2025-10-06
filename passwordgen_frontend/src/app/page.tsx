"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    secretKey: "",
  });
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      // Send signup request to backend (endpoint is "/")
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/`, form);

      const { message: successMsg, userId } = res.data;

      // Store userId in sessionStorage
      sessionStorage.setItem("userId", userId);

      setMessage(successMsg);

      // Reset form
      setForm({ name: "", email: "", password: "", secretKey: "" });

      // Redirect to /home/:userId after 1 second
      setTimeout(() => router.push(`/home/${userId}`), 1000);
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || "Signup failed"}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-96">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
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
            Sign Up
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
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

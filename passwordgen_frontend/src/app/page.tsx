"use client";

import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  secretKey: string;
}

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    secretKey: "",
  });

  const [message, setMessage] = useState<string>("");

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    try {
      // Send signup request to backend
      const res = await axios.post<{ message: string; userId: string }>(
        `${process.env.NEXT_PUBLIC_API_URL}/`,
        form
      );

      const { message: successMsg, userId } = res.data;

      // Store userId in sessionStorage
      sessionStorage.setItem("userId", userId);

      setMessage(successMsg);

      // Reset form
      setForm({ name: "", email: "", password: "", secretKey: "" });

      // Redirect to /home/:userId after 1 second
      setTimeout(() => router.push(`/home/${userId}`), 1000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setMessage(`❌ ${err.response?.data?.error || "Signup failed"}`);
      } else {
        setMessage("❌ Signup failed");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-slate-900">
      <div className="bg-gray-800 shadow-2xl rounded-2xl p-8 w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">
            Create Account
          </h1>
          <p className="text-gray-400 text-sm">Join us today and get started</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            name="name"
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
            required
          />

          <input
            name="secretKey"
            type="text"
            placeholder="Secret Key"
            value={form.secretKey}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-gray-500"
            required
          />

          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            Sign Up
          </button>
        </form>

        {message && (
          <div className="mt-5 p-3 rounded-lg text-center font-medium animate-fade-in">
            {message.startsWith("✅") ? (
              <span className="text-green-400 bg-green-900 bg-opacity-30 block py-2 rounded-md">{message}</span>
            ) : (
              <span className="text-red-400 bg-red-900 bg-opacity-30 block py-2 rounded-md">{message}</span>
            )}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-400 hover:text-blue-400 font-semibold hover:underline transition-colors"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

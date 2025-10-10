"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

// Vault entry type
interface VaultEntry {
  _id: string;
  siteName: string;
  link: string;
  password: string;
}

// Form state type
interface FormState {
  siteName: string;
  link: string;
  password: string;
}

// Password options type
interface PasswordOptions {
  letters: number;
  numbers: number;
  symbols: number;
}

export default function UserHomePage() {
  const { userId } = useParams();
  const userIdStr = Array.isArray(userId) ? userId[0] : userId;
  const router = useRouter();

  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [form, setForm] = useState<FormState>({
    siteName: "",
    link: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<PasswordOptions>({
    letters: 8,
    numbers: 4,
    symbols: 2,
  });

  // Fetch user data
  const fetchUserData = async (uid: string) => {
    try {
      const response = await axios.get(`https://genvault-backend.vercel.app/api/entries/${uid}`);
      setEntries(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Fetch entries when userId changes
  useEffect(() => {
    if (userIdStr) fetchUserData(userIdStr);
  }, [userIdStr]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save new entry
  const handleSave = async () => {
    try {
      await axios.post(`https://genvault-backend.vercel.app/api/save/${userIdStr}`, form);
      setMessage("✅ Data saved successfully!");
      setForm({ siteName: "", link: "", password: "" });
      fetchUserData(userIdStr); // ✅ FIXED LINE HERE
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      console.error(error);
      setMessage("❌ Error saving data!");
    }
  };

  // Generate password
  const generatePassword = async () => {
    try {
      const response = await axios.post("https://genvault-backend.vercel.app/api/generate", options);
      setForm({ ...form, password: response.data.password });
    } catch (error) {
      console.error("Error generating password:", error);
    }
  };

  // Filtered search results
  const filteredEntries = entries.filter((entry) =>
    entry.siteName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔐 Welcome to GenVault</h1>

      {/* Message */}
      {message && <p className="mb-4 text-green-600">{message}</p>}

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          name="siteName"
          placeholder="Site Name"
          value={form.siteName}
          onChange={handleChange}
          className="border rounded-xl p-2"
        />
        <input
          type="text"
          name="link"
          placeholder="URL"
          value={form.link}
          onChange={handleChange}
          className="border rounded-xl p-2"
        />
        <input
          type="text"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border rounded-xl p-2"
        />
      </div>

      {/* Password Options */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="number"
          name="letters"
          placeholder="Letters"
          value={options.letters}
          onChange={(e) => setOptions({ ...options, letters: Number(e.target.value) })}
          className="border rounded-xl p-2 w-24"
        />
        <input
          type="number"
          name="numbers"
          placeholder="Numbers"
          value={options.numbers}
          onChange={(e) => setOptions({ ...options, numbers: Number(e.target.value) })}
          className="border rounded-xl p-2 w-24"
        />
        <input
          type="number"
          name="symbols"
          placeholder="Symbols"
          value={options.symbols}
          onChange={(e) => setOptions({ ...options, symbols: Number(e.target.value) })}
          className="border rounded-xl p-2 w-24"
        />
        <button onClick={generatePassword} className="bg-blue-600 text-white rounded-xl px-4 py-2">
          Generate Password
        </button>
        <button onClick={handleSave} className="bg-green-600 text-white rounded-xl px-4 py-2">
          Save
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search Site"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border rounded-xl p-2 w-full mb-4"
      />

      {/* Entries List */}
      <div className="grid gap-3">
        {filteredEntries.map((entry) => (
          <div key={entry._id} className="border p-4 rounded-xl shadow-sm bg-white">
            <h3 className="text-lg font-semibold">{entry.siteName}</h3>
            <p className="text-gray-700">{entry.link}</p>
            <p className="font-mono bg-gray-100 p-2 rounded">{entry.password}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

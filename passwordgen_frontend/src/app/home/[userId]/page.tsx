"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

export default function UserHomePage() {
  const router = useRouter();
  const { userId } = useParams(); // dynamic route param

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ siteName: "", link: "", password: "" });
  const [entries, setEntries] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [passwordOptions, setPasswordOptions] = useState({ letters: 6, numbers: 2, symbols: 2 });
  const [searchTerm, setSearchTerm] = useState(""); // 🔹 Search state

  // ✅ Check authentication
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    if (!storedUserId) {
      router.push("/login");
      return;
    }

    if (storedUserId !== userId) {
      alert("You can only access your own data!");
      router.push(`/home/${storedUserId}`);
      return;
    }

    setAuthUserId(storedUserId);
    fetchUserData(storedUserId);
  }, [router, userId]);

  // ✅ Fetch saved data from backend
  const fetchUserData = async (id: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vault/${id}`);
      setEntries(res.data);
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Handle password generator change
  const handleGeneratorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordOptions({ ...passwordOptions, [e.target.name]: Number(e.target.value) });
  };

  // ✅ Generate password based on user input
  const generatePassword = () => {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+{}[]<>?/|";

    let pwd = "";
    for (let i = 0; i < passwordOptions.letters; i++) pwd += letters[Math.floor(Math.random() * letters.length)];
    for (let i = 0; i < passwordOptions.numbers; i++) pwd += numbers[Math.floor(Math.random() * numbers.length)];
    for (let i = 0; i < passwordOptions.symbols; i++) pwd += symbols[Math.floor(Math.random() * symbols.length)];

    pwd = pwd.split("").sort(() => Math.random() - 0.5).join("");
    setForm({ ...form, password: pwd });
  };

  // ✅ Handle save (POST to backend)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/save`, { userId, ...form });
      setMessage("✅ Data saved successfully!");
      setForm({ siteName: "", link: "", password: "" });
      fetchUserData(userId as string);
    } catch (err: any) {
      console.error(err);
      setMessage(`❌ ${err.response?.data?.error || "Failed to save data"}`);
    }
  };

  // ✅ Handle delete
  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/vault/${id}`);
      setEntries(entries.filter(item => item._id !== id));
      setMessage("✅ Entry deleted successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to delete entry");
    }
  };

  // 🔹 Filtered entries based on search term
  const filteredEntries = entries.filter(entry =>
    entry.siteName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authUserId)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Checking authentication...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Your Vault
          </h1>
          <p className="text-gray-600">Securely manage your passwords</p>
        </div>

        {/* Add Entry Form */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Add New Entry
          </h2>
          
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input 
                name="siteName" 
                type="text" 
                placeholder="e.g., GitHub, Gmail, Netflix" 
                value={form.siteName} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site URL</label>
              <input 
                name="link" 
                type="url" 
                placeholder="https://example.com" 
                value={form.link} 
                onChange={handleChange} 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="flex gap-2">
                <input 
                  name="password" 
                  type="text" 
                  placeholder="Enter or generate password" 
                  value={form.password} 
                  onChange={handleChange} 
                  className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none font-mono" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowGenerator(!showGenerator)} 
                  className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 px-5 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow"
                >
                  {showGenerator ? "Hide" : "Generate"}
                </button>
              </div>
            </div>

            {showGenerator && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl space-y-4 border border-blue-100 animate-in fade-in slide-in-from-top-2 duration-300">
                <h3 className="font-semibold text-gray-800 text-sm">Password Generator Options</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                    <label className="text-sm font-medium text-gray-700">Letters</label>
                    <input 
                      name="letters" 
                      type="number" 
                      min="0" 
                      value={passwordOptions.letters} 
                      onChange={handleGeneratorChange} 
                      className="border border-gray-300 p-2 w-20 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                    <label className="text-sm font-medium text-gray-700">Numbers</label>
                    <input 
                      name="numbers" 
                      type="number" 
                      min="0" 
                      value={passwordOptions.numbers} 
                      onChange={handleGeneratorChange} 
                      className="border border-gray-300 p-2 w-20 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                    <label className="text-sm font-medium text-gray-700">Symbols</label>
                    <input 
                      name="symbols" 
                      type="number" 
                      min="0" 
                      value={passwordOptions.symbols} 
                      onChange={handleGeneratorChange} 
                      className="border border-gray-300 p-2 w-20 rounded-md text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                    />
                  </div>
                </div>
                
                <button 
                  type="button" 
                  onClick={generatePassword} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Generate Password
                </button>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Save Entry
            </button>
          </form>

          {message && (
            <div className={`mt-5 p-4 rounded-lg text-center font-medium animate-in fade-in slide-in-from-top-1 duration-300 ${
              message.startsWith("✅") 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-8 border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">Search Entries</label>
          <input
            type="text"
            placeholder="Search by site name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        {/* Saved Entries */}
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Saved Entries
            <span className="ml-auto text-sm font-normal text-gray-500">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
            </span>
          </h2>
          
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No entries found</p>
              <p className="text-gray-400 text-sm mt-1">Add your first password entry above</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredEntries.map((item) => (
                <li 
                  key={item._id} 
                  className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium text-sm min-w-16">Site:</span>
                        <span className="text-gray-900 font-semibold">{item.siteName}</span>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium text-sm min-w-16">Link:</span>
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline break-all transition-colors"
                        >
                          {item.link}
                        </a>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium text-sm min-w-16">Password:</span>
                        <span className="text-gray-900 font-mono bg-white px-3 py-1 rounded border border-gray-200">{item.password}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleDelete(item._id)} 
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
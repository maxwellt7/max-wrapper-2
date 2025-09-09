"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react"; 

interface AuthFormProps {
  next?: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export default function AuthForm({ next, onSuccess, onError }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, next }),
      });

      const data = await response.json();

      if (data.status === "Success") {
        onSuccess?.(data.message);
      } else {
        throw new Error(data.message || "Failed to send magic link");
      }
    } catch (error) {
      console.error("Error sending magic link:", error);
      onError?.(error instanceof Error ? error.message : "Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5 w-full">
        <label className="text-left block font-semibold mb-2"> ✉️ Email </label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="tupac@shakur.com"
          required
          className="input w-full p-3 rounded-xl shadow-sm focus:outline-none border-base-300 bg-white text-base-content-content"
        />
      </div>

      <button
        disabled={isLoading}
        title="Send magic link"
        type="submit"
        className={`btn bg-primary hover:bg-primary/70 rounded-xl text-white w-full p-3 font-medium ${
          isLoading ? "bg-primary/80" : ""
        }`}
        role="button"
      >
        {!isLoading && <Mail className="h-5 w-5 mr-2" />}
        {isLoading ? "Loading..." : "Send Magic Link"}
      </button>
    </form>
  );
}

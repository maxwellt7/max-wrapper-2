"use client";

import React, { useState, useRef, useEffect } from "react";
import GoogleSignInButton from "@/components/(ui-components)/auth/google-signin";
import AuthForm from "@/components/(ui-components)/auth/auth-form";
import MessageDisplay from "@/components/(ui-components)/auth/message-display";
import { tosUrl, privacyPolicyUrl } from "@/config";
import { companyConfig } from "@/config";
import Logo from "@/components/Logo";

interface AuthModalProps {
  onClose: () => void;
  salesCount: number;
  next: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, salesCount, next }) => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, next, salesCount]);

  const handleCloseClick = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-base-100/50 flex items-center justify-center z-50"
      data-theme={companyConfig.company.theme}
    >
      <div
        ref={modalRef}
        className="bg-base-200 p-8 rounded-xl shadow-xl max-w-md w-full relative"
      >
        <button
          onClick={handleCloseClick}
          className="absolute top-2 right-2 text-primary opacity-70 hover:opacity-100"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex justify-center items-center mb-6">
          <Logo />
        </div>

        {message && (
          <MessageDisplay message={message} messageType={messageType} />
        )}

        <h1 className="text-xl font-medium mt-4 text-primary">
          Build your AI startup in hours.
        </h1>
        <p className="mt-2 text-sm text-primary/80">
          Please login or sign up to continue.
        </p>

        <div className="py-4">
          <GoogleSignInButton next={next} />

          <div className="flex flex-col w-full">
            <div className="divider bg-base-200">
              <p className="text-xs text-primary/80">OR</p>
            </div>

            <AuthForm
              next={next}
              onSuccess={(msg) => {
                setMessage(msg);
                setMessageType("success");
              }}
              onError={(msg) => {
                setMessage(msg);
                setMessageType("error");
              }}
            />
            <p className="mt-4 text-xs text-primary/60">
              When creating a new account, you agree to the
              <a
                href={tosUrl}
                target="_blank"
                className="underline text-primary/80"
              >
                {" "}
                terms &amp; conditions
              </a>{" "}
              and
              <a
                href={privacyPolicyUrl}
                target="_blank"
                className="underline text-primary/80"
              >
                {" "}
                privacy policy
              </a>
              .{" "}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

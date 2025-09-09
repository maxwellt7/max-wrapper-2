"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { LogIn, KeyRound, Clock, Lock } from "lucide-react";
import AuthModal from "@/components/(ui-components)/auth/auth-modal";

// Grid Pattern Component
function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

export default function Login() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="p-10 group/login block rounded-lg w-full relative overflow-hidden min-h-[600px]">
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-md mx-auto">
          {/* Icon Pattern */}
          <div className="relative mb-16 w-[200px] h-[200px]">
            {/* Center circle with login icon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center z-10">
              <LogIn className="w-7 h-7 text-neutral-600 dark:text-neutral-300" />
            </div>

            {/* Static background icons */}
            <div className="absolute inset-0">
              {[
                { icon: Lock, top: "10%", left: "50%" },
                { icon: KeyRound, top: "30%", left: "20%" },
                { icon: Clock, top: "50%", left: "10%" },
                { icon: Lock, top: "70%", left: "20%" },
                { icon: KeyRound, top: "90%", left: "50%" },
                { icon: Clock, top: "70%", left: "80%" },
                { icon: Lock, top: "50%", left: "90%" },
                { icon: KeyRound, top: "30%", left: "80%" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    top: item.top,
                    left: item.left,
                  }}
                >
                  <item.icon className="w-5 h-5 text-neutral-200 dark:text-neutral-800" />
                </div>
              ))}
            </div>
          </div>

          {/* Title and Description */}
          <div className="text-center space-y-2 mb-10">
            <h2 className="relative z-20 font-sans font-semibold text-neutral-700 dark:text-neutral-300 text-lg">
              Login Required
            </h2>
            <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base">
              Please log in to test out the demo app
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="relative bg-black dark:bg-white text-white dark:text-black rounded-full px-8 py-2.5 text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <LogIn className="w-4 h-4" />
            Sign in to continue
          </button>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          next={pathname}
          salesCount={0}
        />
      )}
    </>
  );
}

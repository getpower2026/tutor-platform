"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, User, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12 sm:h-16 items-center">
          <Link href="/" className="flex items-center gap-1 font-bold text-sm sm:text-xl text-primary-600">
            <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" />
            TutorLink
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            <Link href="/teachers" className="text-gray-600 hover:text-gray-900 font-medium text-xs sm:text-base">
              尋找老師
            </Link>
            <Link href="/guide" className="bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors">
              📖 上課說明
            </Link>

            {session ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link href="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-xs sm:text-base">
                  <LayoutDashboard className="w-3 h-3 sm:w-4 sm:h-4" />
                  控制台(上課)
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs sm:text-base"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  登出
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-3">
                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium text-xs sm:text-base">
                  登入
                </Link>
                <Link href="/register" className="btn-primary text-xs sm:text-base px-2 py-1 sm:px-4 sm:py-2">
                  免費註冊
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { BookOpen, User, LogOut, LayoutDashboard } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <BookOpen className="w-6 h-6" />
            給力一對一線上家教
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/teachers" className="text-gray-600 hover:text-gray-900 font-medium">
              尋找老師
            </Link>

            {session ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
                  <LayoutDashboard className="w-4 h-4" />
                  控制台
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                >
                  <LogOut className="w-4 h-4" />
                  登出
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                  登入
                </Link>
                <Link href="/register" className="btn-primary">
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

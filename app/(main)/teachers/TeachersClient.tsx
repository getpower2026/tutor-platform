"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { TeacherCard } from "@/components/teacher/TeacherCard";
import { Search, SlidersHorizontal } from "lucide-react";

const SUBJECTS = ["國文", "英文", "數學", "社會", "歷史", "地理", "公民", "自然", "物理", "化學", "生物", "地科", "理化", "全民英檢", "多益", "劍橋英檢"];

export function TeachersClient({ initialTeachers }: { initialTeachers: any[] }) {
  const [teachers, setTeachers] = useState<any[]>(initialTeachers);
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async (newQ: string, newSubject: string, newMaxRate: string, newSortBy: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newSubject) params.set("subject", newSubject);
    if (newMaxRate) params.set("maxRate", newMaxRate);
    if (newSortBy) params.set("sortBy", newSortBy);
    const res = await fetch(`/api/teachers?${params}`);
    const data = await res.json();
    setTeachers(data);
    setLoading(false);
  };

  const handleQ = (v: string) => { setQ(v); search(v, subject, maxRate, sortBy); };
  const handleSubject = (v: string) => { setSubject(v); search(q, v, maxRate, sortBy); };
  const handleMaxRate = (v: string) => { setMaxRate(v); search(q, subject, v, sortBy); };
  const handleSortBy = (v: string) => { setSortBy(v); search(q, subject, maxRate, v); };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">尋找家教老師</h1>
        <p className="text-gray-500 mb-8">找到最適合你的專業家教老師，免費線上一對一教學</p>

        <div className="card p-4 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={q} onChange={(e) => handleQ(e.target.value)} placeholder="搜尋老師名字..." className="input pl-9" />
          </div>
          <select value={subject} onChange={(e) => handleSubject(e.target.value)} className="input w-full sm:w-40">
            <option value="">所有科目</option>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={maxRate} onChange={(e) => handleMaxRate(e.target.value)} className="input w-full sm:w-44">
            <option value="">任何價格</option>
            <option value="500">NT$500 以下</option>
            <option value="800">NT$800 以下</option>
            <option value="1200">NT$1,200 以下</option>
            <option value="2000">NT$2,000 以下</option>
          </select>
          <select value={sortBy} onChange={(e) => handleSortBy(e.target.value)} className="input w-full sm:w-40">
            <option value="">最新加入</option>
            <option value="rating">評價最高</option>
          </select>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200" />
                  <div className="flex-1"><div className="h-4 bg-gray-200 rounded mb-2 w-3/4" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
                </div>
                <div className="h-3 bg-gray-100 rounded mb-2" /><div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <SlidersHorizontal className="w-12 h-12 mx-auto mb-4" />
            <p className="text-lg">找不到符合條件的老師</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => <TeacherCard key={t.id} teacher={t} />)}
          </div>
        )}
      </div>
    </div>
  );
}

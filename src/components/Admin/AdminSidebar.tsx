"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const NavLinks = () => (
    <>
      <a href="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Dashboard
      </a>
      <a href="/admin/categories" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M8 21V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Categories
      </a>
      <a href="/admin/products" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Products
      </a>
      <a href="/admin/orders" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M3 11h18M7 21h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Orders
      </a>
      <a href="/admin/settings" className="flex items-center gap-2 px-3 py-2 rounded hover:bg-slate-50 text-slate-700 transition">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09c.67 0 1.26-.36 1.51-1a1.65 1.65 0 0 0-.33-1.82L3.3 3.7A2 2 0 1 1 6.14.86l.06.06c.5.5 1.16.78 1.82.33.67-.46 1.49-.46 2.16 0l.06.06c.66.44 1.32.22 1.82-.33l.06-.06A2 2 0 1 1 17.7 3.3l-.06.06c-.5.5-.78 1.16-.33 1.82.46.67.46 1.49 0 2.16l-.06.06c-.44.66-.22 1.32.33 1.82l.06.06A2 2 0 1 1 22.14 9.86l-.06-.06c-.5-.5-1.16-.78-1.82-.33-.67.46-1.49.46-2.16 0l-.06-.06c-.66-.44-1.32-.22-1.82.33l-.06.06A2 2 0 0 1 19.4 15z" stroke="currentColor" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Settings
      </a>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-lg bg-[#0071CE] text-white shadow-lg hover:bg-[#005fb0] transition"
        aria-label="Toggle admin menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        lg:static fixed top-0 left-0 h-full lg:h-auto z-40
        bg-white border rounded p-4 shadow-sm
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 lg:w-full overflow-y-auto
      `}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Admin Panel</h2>
          <p className="text-sm text-slate-600">Manage your store</p>
        </div>

        <nav className="flex flex-col gap-1">
          <NavLinks />
        </nav>

        <div className="mt-6 border-t pt-4">
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="w-full text-left px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

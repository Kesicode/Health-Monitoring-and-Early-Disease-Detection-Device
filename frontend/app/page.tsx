"use client";

import Link from "next/link";
import { Activity, Heart, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Agri Guard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Activity className="w-4 h-4" />
          Real-time livestock monitoring
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Keep your animals
          <br />
          <span className="text-primary">healthy &amp; thriving</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
          Agri Guard uses IoT collar devices to monitor your livestock health in real time —
          temperature, heart rate, SpO₂, and activity — with instant alerts when something goes wrong.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register" className="bg-primary text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:bg-primary/90 transition-colors">
            Start monitoring
          </Link>
          <Link href="/login" className="border border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:bg-white transition-colors">
            Sign in
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-8 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Activity, title: "Real-time vitals", desc: "Monitor temperature, heart rate, SpO₂ and activity level live as data streams from collar devices." },
          { icon: Zap, title: "Instant alerts", desc: "Get notified the moment a reading crosses safe thresholds — before it becomes a crisis." },
          { icon: Shield, title: "Secure & reliable", desc: "Role-based access for farmers and admins. All data encrypted in transit." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center mb-4">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

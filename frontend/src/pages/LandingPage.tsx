import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Flame,
  Truck,
  Lightbulb,
  Droplets,
  Wrench,
  Search
} from 'lucide-react';
import { CivicMap } from '../components/map/CivicMap';
import { apiClient } from '../api/client';
import { Complaint, Hotspot } from '../types';

export const LandingPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [trackRef, setTrackRef] = useState('');

  useEffect(() => {
    apiClient.getComplaints({ limit: 40 }).then(setComplaints);
    apiClient.getHotspots().then(setHotspots);
  }, []);

  const categories = [
    { title: 'Roads & Infrastructure', icon: Wrench, count: 'Potholes, broken footpaths', color: 'bg-red-50 text-red-600' },
    { title: 'Waste Management', icon: Truck, count: 'Garbage dump, missed pickup', color: 'bg-teal-50 text-teal-600' },
    { title: 'Streetlights', icon: Lightbulb, count: 'Outages, dark stretches', color: 'bg-amber-50 text-amber-600' },
    { title: 'Drainage & Sewage', icon: Droplets, count: 'Blocked drains, waterlog', color: 'bg-blue-50 text-blue-600' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-100/60 via-[#F4F7FA] to-white pt-16 pb-20 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-teal-50 border border-teal-200/80 text-[#087F8C] px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Civic Action Platform for Bengaluru</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#102E50] tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Smarter Cities. <span className="text-[#087F8C]">Stronger Communities.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Transforming scattered citizen complaints into prioritized, explainable, and trackable municipal action across 198 BBMP wards.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Link
              to="/submit"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-white bg-[#087F8C] hover:bg-[#06636D] shadow-sm hover:shadow-md transition-all text-sm"
            >
              Report a Civic Issue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <Link
              to="/public-map"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-[#102E50] bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all text-sm"
            >
              <MapPin className="w-4 h-4 mr-2 text-[#087F8C]" />
              Explore Civic Map
            </Link>
          </motion.div>

          {/* Quick Track Bar */}
          <div className="mt-10 max-w-md mx-auto bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              placeholder="Track complaint by Reference ID (e.g. BLR-2024-0001)..."
              value={trackRef}
              onChange={(e) => setTrackRef(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none"
            />
            <Link
              to={trackRef ? `/track?ref=${trackRef}` : '/track'}
              className="px-3.5 py-1.5 bg-[#102E50] hover:bg-[#1D426D] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Track
            </Link>
          </div>
        </div>
      </section>

      {/* 4-Stage Workflow Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#087F8C] uppercase tracking-wider">How CivicAI Works</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102E50] mt-1">From Complaint to Municipal Action</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            A continuous four-stage pipeline connecting citizen voices with verified government resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              num: '01',
              stage: 'CAPTURE',
              desc: 'Citizens report issues in under 1 minute with location, description, and photo evidence.',
              color: 'border-l-4 border-[#087F8C]'
            },
            {
              num: '02',
              stage: 'UNDERSTAND',
              desc: 'Gemini AI automatically classifies the issue, checks for duplicates, and assigns explainable priority.',
              color: 'border-l-4 border-amber-500'
            },
            {
              num: '03',
              stage: 'REVEAL',
              desc: 'DBSCAN spatial clustering pinpoints geographic hotspots and recurring issues across wards.',
              color: 'border-l-4 border-red-500'
            },
            {
              num: '04',
              stage: 'ACT',
              desc: 'Municipal officers receive assignments, post progress updates, and citizens verify resolution.',
              color: 'border-l-4 border-emerald-500'
            }
          ].map((item, idx) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs ${item.color}`}
            >
              <span className="text-2xl font-black text-slate-300 block">{item.num}</span>
              <h3 className="text-base font-bold text-[#102E50] mt-1">{item.stage}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#102E50]">Core Civic Complaint Categories</h3>
              <p className="text-xs text-slate-500 mt-1">Supported and routed directly to BBMP engineering divisions</p>
            </div>
            <Link to="/submit" className="text-xs font-semibold text-[#087F8C] hover:underline flex items-center">
              View all subcategories &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {categories.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-[#102E50]">{cat.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{cat.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Map Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-[#087F8C] uppercase tracking-wider">Live Spatial View</span>
            <h3 className="text-2xl font-bold text-[#102E50]">Bengaluru Public Civic Map</h3>
          </div>
          <Link
            to="/public-map"
            className="text-xs font-semibold text-[#087F8C] hover:underline mt-2 sm:mt-0"
          >
            Open Full Interactive Map &rarr;
          </Link>
        </div>

        <CivicMap
          complaints={complaints}
          hotspots={hotspots}
          height="450px"
        />
      </section>
    </div>
  );
};

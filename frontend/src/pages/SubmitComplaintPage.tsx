import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Camera,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  UploadCloud,
  FileCheck2
} from 'lucide-react';
import { apiClient } from '../api/client';
import { AIAssessmentCard } from '../components/common/AIAssessmentCard';
import { AIAssessment } from '../types';

export const SubmitComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Roads and Infrastructure',
    subcategory: 'Potholes / Road Damage',
    address: '',
    ward: 'Puttenahalli',
    latitude: 12.8943,
    longitude: 77.5872,
  });

  // AI draft assistant
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAssessment | null>(null);

  const categories = [
    'Roads and Infrastructure',
    'Waste Management',
    'Streetlights',
    'Drainage and Sewage',
    'Water Supply',
    'Public Safety',
    'Public Facilities',
    'Other'
  ];

  const handleRunAIAssist = async () => {
    if (!formData.title || !formData.description) return;
    setAiAnalyzing(true);
    try {
      const res = await apiClient.analyzeDraft(
        formData.title,
        formData.description,
        formData.category,
        formData.ward
      );
      setAiResult(res);
      setFormData(prev => ({
        ...prev,
        category: res.category,
        subcategory: res.subcategory
      }));
    } catch (e) {
      console.warn('AI Draft check failed:', e);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const created = await apiClient.submitComplaint(formData);
      setSuccessRef(created.reference_id);
    } catch (e) {
      alert('Failed to submit complaint. Please check fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successRef) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm"
        >
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#102E50]">Complaint Submitted!</h2>
          <p className="text-xs text-slate-500 mt-2">
            Your grievance has been safely registered and submitted to the AI analysis queue.
          </p>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold uppercase text-slate-400">Reference Tracking ID</span>
            <p className="text-xl font-mono font-bold text-[#087F8C] mt-1 select-all">{successRef}</p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(`/track?ref=${successRef}`)}
              className="px-5 py-2.5 bg-[#087F8C] text-white text-xs font-semibold rounded-lg hover:bg-[#06636D] transition-colors"
            >
              Track Live Status
            </button>
            <button
              onClick={() => {
                setSuccessRef(null);
                setStep(1);
                setFormData({
                  title: '',
                  description: '',
                  category: 'Roads and Infrastructure',
                  subcategory: 'Potholes / Road Damage',
                  address: '',
                  ward: 'Puttenahalli',
                  latitude: 12.8943,
                  longitude: 77.5872,
                });
                setAiResult(null);
              }}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              Report Another Issue
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#102E50]">Report a Civic Grievance</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Target: Complete in less than 1 minute. AI will categorize and evaluate your report.
        </p>

        {/* Step Indicator */}
        <div className="mt-6 max-w-md mx-auto flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-0" />
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s
                  ? 'bg-[#087F8C] text-white shadow-xs'
                  : 'bg-white text-slate-400 border border-slate-300'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-md mx-auto text-[11px] font-medium text-slate-500 mt-1.5 px-1">
          <span>Details</span>
          <span>Location</span>
          <span>Evidence</span>
          <span>Confirm</span>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-base font-bold text-[#102E50]">Step 1: What is the issue?</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complaint Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hazardous deep pothole on 24th Main Road"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#087F8C] focus:ring-1 focus:ring-[#087F8C] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide context (e.g. Near school entrance, waterlogged during rain, two-wheelers slipping...)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#087F8C] focus:ring-1 focus:ring-[#087F8C] outline-none resize-none"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span>{formData.description.length} / 2000 characters</span>
                  <button
                    type="button"
                    onClick={handleRunAIAssist}
                    disabled={aiAnalyzing || !formData.title || !formData.description}
                    className="inline-flex items-center text-xs font-semibold text-[#087F8C] hover:underline disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    {aiAnalyzing ? 'Analyzing with Gemini...' : 'AI Auto-Suggest Category & Priority'}
                  </button>
                </div>
              </div>

              {/* Show AI Live Suggestion if available */}
              {aiResult && (
                <div className="mt-3">
                  <AIAssessmentCard assessment={aiResult} />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#087F8C] outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ward / Zone</label>
                  <input
                    type="text"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#087F8C] outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!formData.title || !formData.description}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center px-5 py-2.5 bg-[#087F8C] hover:bg-[#06636D] text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors"
                >
                  Next: Location &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-base font-bold text-[#102E50]">Step 2: Where is it located?</h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Street Address / Landmark *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opposite St. Mary's School, 24th Main, HSR Layout Sector 2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:border-[#087F8C] outline-none"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                  <span className="font-semibold flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-[#087F8C]" />
                    Coordinates (Bengaluru)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (pos) => setFormData({ ...formData, latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                          () => alert('Please enable location access or type address.')
                        );
                      }
                    }}
                    className="text-xs text-[#087F8C] font-semibold hover:underline"
                  >
                    Use GPS Current Location
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Latitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Longitude</span>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  disabled={!formData.address}
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-[#087F8C] text-white text-xs font-semibold rounded-lg hover:bg-[#06636D] disabled:opacity-50"
                >
                  Next: Evidence &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-base font-bold text-[#102E50]">Step 3: Upload Evidence (Optional)</h3>
              
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Drag and drop photos or click to browse</p>
                <p className="text-[11px] text-slate-400 mt-1">Accepts JPG, PNG, WebP up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="photo-upload"
                  onChange={() => alert('Photo selected for preview')}
                />
                <label
                  htmlFor="photo-upload"
                  className="mt-3 inline-flex items-center px-3.5 py-1.5 bg-white border border-slate-300 text-xs font-semibold text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50"
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Select Image
                </label>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 bg-[#087F8C] text-white text-xs font-semibold rounded-lg hover:bg-[#06636D]"
                >
                  Next: Confirm & Submit &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-base font-bold text-[#102E50]">Step 4: Review and Submit</h3>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 uppercase text-[10px]">Title</span>
                  <p className="text-sm font-bold text-[#102E50]">{formData.title}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase text-[10px]">Description</span>
                  <p className="text-slate-600">{formData.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="font-semibold text-slate-400 uppercase text-[10px]">Category</span>
                    <p className="font-medium text-slate-800">{formData.category}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 uppercase text-[10px]">Ward</span>
                    <p className="font-medium text-slate-800">{formData.ward}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-400 uppercase text-[10px]">Location</span>
                  <p className="text-slate-700">{formData.address}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    [{formData.latitude}, {formData.longitude}]
                  </p>
                </div>
              </div>

              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200 text-xs text-teal-800 flex items-start space-x-2">
                <FileCheck2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  Upon submission, CivicAI's Gemini pipeline will analyze safety risk factors, flag similar nearby reports, and assign priority for BBMP review.
                </span>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-[#087F8C] hover:bg-[#06636D] text-white text-xs font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Registering with AI Pipeline...' : 'Submit Grievance'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

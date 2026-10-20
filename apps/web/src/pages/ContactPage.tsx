import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-white">Contact & Support</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2">
          Have an inquiry, threat intelligence tip, or API partnership request?
        </p>
      </div>

      <div className="glass-card rounded-2xl p-8 border border-navy-800">
        {submitted ? (
          <div className="text-center py-10 space-y-3">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Message Sent Successfully</h2>
            <p className="text-xs text-slate-400">
              Our cybersecurity support team will review your message and reply via email within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Taylor Smith"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="taylor@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Incident Reporting / Threat Intelligence"
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe your question or suspicious activity observed..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-slate-100 focus:outline-none focus:border-brand-primary"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-primary hover:bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 transition-all"
            >
              <Send size={14} /> Send Inquiry
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

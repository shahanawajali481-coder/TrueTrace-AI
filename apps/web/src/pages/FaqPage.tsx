import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does TrueTrace AI hack into accounts or read private direct messages?',
      a: 'Absolutely not. TrueTrace AI strictly adheres to digital privacy laws and cybersecurity ethics. We never attempt to discover passwords, bypass multi-factor authentication, intercept OTP codes, or read private communications.'
    },
    {
      q: 'Why is an assessment marked as INCONCLUSIVE?',
      a: 'An INCONCLUSIVE result occurs when the authoritative sources necessary to verify an identifier could not be reached or provided insufficient evidence. TrueTrace AI refuses to fabricate results: if we cannot prove a signal, we say so honestly.'
    },
    {
      q: 'Does a low risk score mean an account or sender is 100% safe?',
      a: 'No. A low risk score means that authoritative DNS, mail configuration, and threat logs showed no known malicious patterns at the time of evaluation. Attackers can still compromise legitimate accounts. Always exercise vigilance with unverified requests.'
    },
    {
      q: 'How does TrueTrace AI detect disposable emails?',
      a: 'We evaluate the domain against a continually curated registry of recognized disposable, throwaway, and forwarding inbox providers (such as 10minutemail, mailinator, tempmail, etc.).'
    },
    {
      q: 'Can I export reports for my company or law enforcement?',
      a: 'Yes. Every assessment report can be exported as an official, tamper-evident PDF audit summary or downloaded as structured JSON.'
    },
    {
      q: 'How can I install TrueTrace AI on mobile and desktop?',
      a: 'TrueTrace AI is available as an installable Progressive Web App (PWA), a native Android application (APK/AAB), and a Windows desktop client.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-semibold mb-3">
          Knowledge Base
        </div>
        <h1 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2">
          Clear answers about how TrueTrace AI functions, privacy policies, and verification standards.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6 border border-navy-800 divide-y divide-navy-800">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="py-4">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between text-left text-sm font-semibold text-white hover:text-brand-primary transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {isOpen && (
                <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed animate-in fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

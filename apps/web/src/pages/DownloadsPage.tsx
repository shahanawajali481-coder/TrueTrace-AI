import React from 'react';
import { Smartphone, Monitor, Globe, Download, CheckCircle2, Terminal } from 'lucide-react';

export const DownloadsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-semibold mb-3">
          Cross-Platform TrueTrace AI
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          Download & Install Applications
        </h1>
        <p className="text-sm text-slate-300 mt-3 leading-relaxed">
          Access TrueTrace AI across your browser, native Android smartphone, or Windows desktop computer with a single synchronized account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* PWA */}
        <div className="glass-card rounded-3xl p-8 border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-brand-primary flex items-center justify-center mb-4">
              <Globe size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Web Application / PWA</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Instant access without downloading huge files. Install directly to your desktop or mobile home screen through modern browsers.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 mb-6">
              <li>✓ Offline fallback capability</li>
              <li>✓ Automatic silent background updates</li>
              <li>✓ No device permissions required</li>
            </ul>
          </div>
          <button
            onClick={() => alert('To install TrueTrace PWA, click the install icon in your browser address bar or "Add to Home Screen" on mobile.')}
            className="w-full py-2.5 rounded-xl bg-brand-primary/20 text-brand-primary border border-brand-primary/30 text-xs font-semibold hover:bg-brand-primary/30 transition-colors"
          >
            Install Web App (PWA)
          </button>
        </div>

        {/* Android */}
        <div id="android" className="glass-card rounded-3xl p-8 border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <Smartphone size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Native Android App</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Built with React Native & Expo. Features hardware-backed encrypted token storage (SecureStore) and responsive mobile ergonomics.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 mb-6">
              <li>✓ Hardware-encrypted credentials</li>
              <li>✓ Zero background telemetry collection</li>
              <li>✓ Android back-button & keyboard handling</li>
            </ul>
          </div>
          <div className="space-y-2">
            <a
              href="#android-guide"
              className="block text-center w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              View APK & Build Steps
            </a>
          </div>
        </div>

        {/* Windows */}
        <div id="desktop" className="glass-card rounded-3xl p-8 border border-navy-800 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-brand-violet flex items-center justify-center mb-4">
              <Monitor size={24} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Windows Desktop App</h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Dedicated Windows client running with strict Content Security Policy, context isolation, and secure IPC communication.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-400 mb-6">
              <li>✓ Dedicated taskbar window</li>
              <li>✓ Restricted external URL navigation</li>
              <li>✓ No hardcoded secrets or arbitrary shell execution</li>
            </ul>
          </div>
          <a
            href="#desktop-guide"
            className="block text-center w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors"
          >
            Windows Packaging Guide
          </a>
        </div>
      </div>

      {/* Build and Installation Detailed Commands */}
      <div id="android-guide" className="p-8 rounded-3xl bg-navy-900/60 border border-navy-800 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal size={20} className="text-emerald-400" />
          Android Build & Release Instructions (PowerShell)
        </h2>
        <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
          <div className="text-slate-500"># 1. Navigate to Android project directory</div>
          <div>cd apps\android</div>
          <div className="text-slate-500"># 2. Install dependencies</div>
          <div>npm install</div>
          <div className="text-slate-500"># 3. Start local Expo development server</div>
          <div>npx expo start --android</div>
          <div className="text-slate-500"># 4. Generate local signed APK or production AAB bundle with EAS</div>
          <div>npx eas-cli build --platform android --profile preview --local</div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong>Google Play Console Release:</strong> To submit to the Google Play Store, generate a release App Bundle (<code>.aab</code>) using <code>eas build --platform android</code> with your configured Play Console upload keystore. Upload the generated <code>.aab</code> artifact to your Production or Internal Testing track in the Play Console.
        </p>
      </div>

      <div id="desktop-guide" className="p-8 rounded-3xl bg-navy-900/60 border border-navy-800 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Terminal size={20} className="text-brand-violet" />
          Windows Desktop Build Instructions (PowerShell)
        </h2>
        <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
          <div className="text-slate-500"># 1. Navigate to Desktop directory</div>
          <div>cd apps\desktop</div>
          <div className="text-slate-500"># 2. Install desktop dependencies</div>
          <div>npm install</div>
          <div className="text-slate-500"># 3. Run desktop client in development mode</div>
          <div>npm run dev</div>
          <div className="text-slate-500"># 4. Package Windows installer (.exe) with electron-builder</div>
          <div>npm run dist:win</div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The packaging script produces an installable Windows NSIS setup package in <code>apps/desktop/dist/</code> with strict Content Security Policy, context isolation, and sanitized external link handling.
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { Bolt } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-xl bg-[#f8f9ff] dark:bg-[#0b1c30] border-t border-[#c7c4d8]/20 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-4 md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter font-medium text-sm text-left">
        {/* Brand column */}
        <div className="flex flex-col gap-4 md:col-span-2">
          <a href="#" className="font-semibold text-xl text-primary dark:text-primary-fixed flex items-center gap-2 hover:opacity-95 transition-opacity">
            <Bolt className="w-6 h-6 text-primary-container dark:text-primary-fixed fill-current animate-pulse" />
            <span className="font-bold tracking-tight text-[#0b1c30] dark:text-[#f8f9ff] font-display">SkillElevate</span>
          </a>
          <div className="flex flex-col gap-1.5 mt-2 text-sm w-full text-left">
            <span className="font-bold text-[#0b1c30] dark:text-slate-200">© 2026 SkillElevate.</span>
            <p className="text-on-surface-variant dark:text-slate-400 font-normal leading-relaxed text-pretty opacity-90 w-full">
              Empowering the next generation of digital leaders through premium educational experience and expert-led programs.
            </p>
          </div>
        </div>

        {/* Company links */}
        <div className="flex flex-col gap-2.5">
          <h5 className="font-bold text-xs uppercase tracking-wider text-[#0b1c30] dark:text-slate-200 mb-2">
            Company
          </h5>
          <a href="#" className="font-normal text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed hover:underline transition-all">
            About Us
          </a>
          <a href="#" className="font-normal text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed hover:underline transition-all">
            Careers
          </a>
          <a href="#" className="font-normal text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed hover:underline transition-all">
            Help Center
          </a>
        </div>

        {/* Legal links */}
        <div className="flex flex-col gap-2.5">
          <h5 className="font-bold text-xs uppercase tracking-wider text-[#0b1c30] dark:text-slate-200 mb-2">
            Legal
          </h5>
          <a href="#" className="font-normal text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed hover:underline transition-all">
            Privacy Policy
          </a>
          <a href="#" className="font-normal text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed hover:underline transition-all">
            Terms of Service
          </a>
          <a href="#" className="font-normal text-on-surface-variant dark:text-slate-400 hover:text-primary dark:hover:text-primary-fixed hover:underline transition-all">
            Cookie Settings
          </a>
        </div>
      </div>
    </footer>
  );
}

import { navigation, profile } from '../data/portfolio';
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <nav aria-label="Main navigation" className="fixed top-0 inset-x-0 z-[100] bg-[#05070A]/95 backdrop-blur-md border-b border-[#00FFAB]/15">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 min-h-16 flex items-center justify-between gap-8">
        <a href="#home" onClick={() => setOpen(false)} className="shrink-0 font-bold tracking-wide text-[#00FFAB] text-sm sm:text-base">{profile.name}</a>
        <button type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="portfolio-navigation" onClick={() => setOpen(!open)} className="xl:hidden p-2 text-[#00FFFF]">
          {open ? <X /> : <Menu />}
        </button>
        <ul id="portfolio-navigation" className={`${open ? 'flex' : 'hidden'} absolute top-16 inset-x-0 bg-[#05070A] border-b border-[#00FFAB]/15 p-5 flex-col gap-5 xl:static xl:flex xl:flex-row xl:items-center xl:justify-center xl:flex-1 xl:bg-transparent xl:border-0 xl:p-0 xl:gap-6`}>
          {navigation.map(link => <li key={link.href}><a href={link.href} onClick={() => setOpen(false)} className="block text-gray-300 hover:text-[#00FFFF] font-mono text-sm whitespace-nowrap transition-colors duration-200">{link.name}</a></li>)}
        </ul>
      </div>
    </nav>
  );
};

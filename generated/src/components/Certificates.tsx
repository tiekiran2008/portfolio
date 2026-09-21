import { DetailDialog } from './DetailDialog';
import type { Certificate } from '../data/portfolio';
import { useFloatingCard } from '../hooks/useFloatingCard';
import React, { useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Award, ExternalLink, Building2, CalendarDays } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { safeLink } from '../lib/projectData';
import { SectionWrapper } from './SectionWrapper';

const IssuerLogo: React.FC<{ logo?: string; issuer: string }> = ({ logo, issuer }) => {
  const [failedUrl, setFailedUrl] = useState<string>();
  // Existing admin records include embedded raster logos; never allow SVG/HTML data URLs.
  const rasterLogo = typeof logo === 'string' && /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(logo) ? logo : undefined;
  const url = rasterLogo ?? safeLink(logo, true);
  return url && failedUrl !== url
    ? <img src={url} alt={`${issuer} logo`} loading="lazy" decoding="async" onError={() => setFailedUrl(url)} className="w-6 h-6 shrink-0 object-contain rounded bg-white/90 p-0.5" />
    : <Building2 aria-hidden="true" className="w-5 h-5 shrink-0 text-[#00FFAB]" />;
};

const FloatingCertificate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const floating = useFloatingCard();
  return <div className="h-full cyber-card-slot" {...floating.handlers}><motion.div style={floating.style} className="glass-panel cyber-pop-card floating-card h-full rounded-2xl border border-gray-800 overflow-hidden min-w-0 flex flex-col">{children}</motion.div></div>;
};

export const Certificates: React.FC = () => {
  const { data: { certificates } } = usePortfolio();
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [zoom, setZoom] = useState(false);
  const close = useCallback(() => setSelected(null), []);
  return (
  <><SectionWrapper id="certificates" stable>
    <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFAB] to-[#00FFFF] text-center w-full">&gt; Certificates &amp; Licenses</h2>
    {certificates.length === 0 ? (
      <div className="glass-panel rounded-2xl border border-gray-800 p-8 text-center text-gray-400 w-full">
        <Award className="w-10 h-10 text-[#00FFAB] mx-auto mb-4" />Certificates &amp; Licenses will be added here soon.
      </div>
    ) : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {certificates.map((certificate, index) => {
        const href = safeLink(certificate.credentialUrl, true);
        return <motion.article key={certificate.id} initial={reducedMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.1, margin: '80px 0px 80px 0px' }} transition={{ duration: 0.6, ease: "easeOut", delay: Math.min(index * 0.05, 0.2) }} className="min-w-0 h-full cyber-card-slot"><FloatingCertificate>
          <button type="button" className="text-left w-full" aria-label={`Open ${certificate.name}`} onClick={() => { setSelected(certificate); setZoom(false); }}>
          {certificate.image ? <img src={certificate.image} alt={certificate.name} loading="lazy" className="w-full h-48 object-contain bg-black/30" /> : <div className="h-48 flex items-center justify-center bg-[#00FFAB]/5"><Award className="w-16 h-16 text-[#00FFAB]" /></div>}
          </button>
          <div className="p-6 flex flex-col flex-1 gap-3 break-words">
            <h3 className="text-xl font-bold text-white">{certificate.name}</h3>
            <p className="flex items-center gap-2 text-gray-300"><IssuerLogo logo={certificate.logo} issuer={certificate.issuer} /><span className="min-w-0 [overflow-wrap:anywhere]">{certificate.issuer}</span></p>
            <p className="flex items-center gap-2 text-sm font-mono text-gray-400"><CalendarDays aria-hidden="true" className="w-4 h-4 shrink-0 text-[#00FFFF]" /><span>{certificate.date}</span></p>
            {certificate.description && <p className="text-gray-300 whitespace-pre-wrap [overflow-wrap:anywhere]">{certificate.description}</p>}
            {!!certificate.skills?.length && <div>
              <h4 className="text-sm text-gray-400 mb-2">Skills / Technologies learned</h4>
              <ul className="flex flex-wrap gap-2">
                {certificate.skills.map((skill, skillIndex) => <li key={skillIndex} className="max-w-full rounded-md border border-[#00FFAB]/20 bg-[#00FFAB]/5 px-3 py-1 text-sm text-[#00FFAB] [overflow-wrap:anywhere]">{skill}</li>)}
              </ul>
            </div>}
            <div className="mt-auto pt-2 flex flex-col gap-3">
            <button type="button" className="enhancement-button" onClick={() => { setSelected(certificate); setZoom(false); }}>Explore certificate</button>
            {href && <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#00FFAB]/40 text-[#00FFAB] hover:bg-[#00FFAB]/10"><ExternalLink className="w-4 h-4 shrink-0" />View Certificate</a>}
            </div>
          </div>
        </FloatingCertificate></motion.article>;
      })}
    </div>}
  </SectionWrapper>
  {selected && <DetailDialog title={selected.name} onClose={close}>
    <div className="flex items-center gap-2 text-gray-300 mb-2"><IssuerLogo logo={selected.logo} issuer={selected.issuer} />{selected.issuer}</div>
    <p className="text-[#00FFFF] mb-4">{selected.date}</p>
    {selected.image && <><button type="button" className="enhancement-button mb-3" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>{zoom ? 'Fit image' : 'Zoom image'}</button><div className="overflow-auto max-h-[55vh] rounded-xl bg-black/40"><img src={selected.image} alt={selected.name} className={zoom ? 'max-w-none w-[150%]' : 'w-full object-contain'} /></div></>}
    {selected.description && <p className="text-gray-300 whitespace-pre-wrap my-4">{selected.description}</p>}
    {!!selected.skills?.length && <ul className="flex flex-wrap gap-2 my-4">{selected.skills.map((skill, i) => <li key={i} className="enhancement-tag">{skill}</li>)}</ul>}
    {safeLink(selected.credentialUrl, true) && <a className="enhancement-button" href={safeLink(selected.credentialUrl, true)} target="_blank" rel="noopener noreferrer">Verify credential ↗</a>}
  </DetailDialog>}</>
  );
};

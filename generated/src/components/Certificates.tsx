import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink, Building2, CalendarDays } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { safeLink } from '../lib/projectData';
import { SectionWrapper } from './SectionWrapper';

const IssuerLogo: React.FC<{ logo?: string; issuer: string }> = ({ logo, issuer }) => {
  const [failedUrl, setFailedUrl] = useState<string>();
  const url = safeLink(logo, true);
  return url && failedUrl !== url
    ? <img src={url} alt={`${issuer} logo`} loading="lazy" onError={() => setFailedUrl(url)} className="w-6 h-6 shrink-0 object-contain rounded bg-white/90 p-0.5" />
    : <Building2 aria-hidden="true" className="w-5 h-5 shrink-0 text-[#00FFAB]" />;
};

export const Certificates: React.FC = () => {
  const { data: { certificates } } = usePortfolio();
  return (
  <SectionWrapper id="certificates">
    <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFAB] to-[#00FFFF] text-center w-full">&gt; Certificates &amp; Licenses</h2>
    {certificates.length === 0 ? (
      <div className="glass-panel rounded-2xl border border-gray-800 p-8 text-center text-gray-400 w-full">
        <Award className="w-10 h-10 text-[#00FFAB] mx-auto mb-4" />Certificates &amp; Licenses will be added here soon.
      </div>
    ) : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {certificates.map((certificate, index) => {
        const href = safeLink(certificate.credentialUrl, true);
        return <motion.article key={certificate.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="glass-panel rounded-2xl border border-gray-800 overflow-hidden min-w-0 flex flex-col">
          {certificate.image ? <img src={certificate.image} alt={certificate.name} loading="lazy" className="w-full h-48 object-contain bg-black/30" /> : <div className="h-48 flex items-center justify-center bg-[#00FFAB]/5"><Award className="w-16 h-16 text-[#00FFAB]" /></div>}
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
            {href && <a href={href} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#00FFAB]/40 text-[#00FFAB] hover:bg-[#00FFAB]/10"><ExternalLink className="w-4 h-4 shrink-0" />View Certificate</a>}
          </div>
        </motion.article>;
      })}
    </div>}
  </SectionWrapper>
  );
};

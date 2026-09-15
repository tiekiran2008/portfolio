import React from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { certificates } from '../data/portfolio';
import { safeLink } from '../lib/projectData';
import { SectionWrapper } from './SectionWrapper';

export const Certificates: React.FC = () => (
  <SectionWrapper id="certificates">
    <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFAB] to-[#00FFFF] text-center w-full">&gt; Certificates</h2>
    {certificates.length === 0 ? (
      <div className="glass-panel rounded-2xl border border-gray-800 p-8 text-center text-gray-400 w-full">
        <Award className="w-10 h-10 text-[#00FFAB] mx-auto mb-4" />Certificates will be added here soon.
      </div>
    ) : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
      {certificates.map((certificate, index) => {
        const href = safeLink(certificate.credentialUrl, true);
        return <motion.article key={certificate.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="glass-panel rounded-2xl border border-gray-800 overflow-hidden min-w-0 flex flex-col">
          {certificate.image ? <img src={certificate.image} alt={certificate.name} loading="lazy" className="w-full h-48 object-contain bg-black/30" /> : <div className="h-48 flex items-center justify-center bg-[#00FFAB]/5"><Award className="w-16 h-16 text-[#00FFAB]" /></div>}
          <div className="p-6 flex flex-col flex-1 gap-3 break-words">
            <h3 className="text-xl font-bold text-white">{certificate.name}</h3>
            <p className="text-gray-300">{certificate.issuer}</p>
            <p className="text-sm font-mono text-gray-500">{certificate.date}</p>
            {href && <a href={href} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-[#00FFAB]/40 text-[#00FFAB] hover:bg-[#00FFAB]/10"><ExternalLink className="w-4 h-4 shrink-0" />View Certificate</a>}
          </div>
        </motion.article>;
      })}
    </div>}
  </SectionWrapper>
);

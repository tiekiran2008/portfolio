import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { SectionWrapper } from './SectionWrapper';
import { Github, Linkedin, Instagram, Send, AlertTriangle } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { supabase } from '../lib/supabase';

const contactSchema = z.object({
  name: z.string().refine(val => (val.match(/[a-zA-Z]/g) || []).length >= 2, {
    message: "Name must contain at least 2 letters"
  }),
  email: z.string().email({ message: "Invalid email address" }),
  message: z.string().refine(val => (val.match(/[a-zA-Z]/g) || []).length >= 2, {
    message: "Message must contain at least 2 letters"
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const Contact: React.FC = () => {
  const { data, updateData } = usePortfolio();
  const [formData, setFormData] = useState<ContactFormData>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateField = (name: keyof ContactFormData, value: string) => {
    try {
      contactSchema.pick({ [name]: true } as any).parse({ [name]: value });
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [name]: error.issues?.[0]?.message }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validate form data
    try {
      contactSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
        error.issues?.forEach((err: any) => {
          if (err.path?.[0]) {
            newErrors[err.path[0] as keyof ContactFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return; // Stop submission if validation fails
    }

    // 2. Process submission
    setIsSubmitting(true);
    
    try {
      const newMessage = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        date: new Date().toISOString()
      };
      
      // Try to save to Supabase if configured
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
        try {
          const { error } = await supabase.from('messages').insert([newMessage]);
          if (error) console.error("Supabase insert error:", error);
        } catch (err) {
          console.error("Failed to save to Supabase:", err);
        }
      }
      
      // Always update local state so UI reflects it immediately
      updateData(prev => ({ 
        messages: [...(prev.messages || []), { ...newMessage, id: Date.now().toString() }] 
      }));
      
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
      
    } catch (err) {
      console.error("Unexpected error during submission:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name as keyof ContactFormData]) {
      validateField(name as keyof ContactFormData, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    validateField(name as keyof ContactFormData, value);
  };

  return (
    <SectionWrapper id="contact">
      <h2 className="text-4xl sm:text-5xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFAB] to-[#00FFFF] inline-block text-center w-full">
        &gt; Contact
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 w-full max-w-6xl mx-auto items-center">
        {/* Left Column: Info & Socials */}
        <div className="flex flex-col justify-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">Get In Touch</h3>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            I'm currently open for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
          </p>
          
          <div className="flex gap-6" style={{ perspective: '1000px' }}>
            <motion.a
              href="https://www.instagram.com/tie_kiran_008_?igsh=MTdodWl3aTljaHlqaw=="
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ 
                scale: 1.15, 
                y: -8, 
                rotateX: 15, 
                rotateY: -15, 
                boxShadow: "0 20px 40px rgba(225, 48, 108, 0.6), 0 0 20px rgba(225, 48, 108, 0.4)",
                borderColor: "rgba(225, 48, 108, 0.8)",
                backgroundColor: "rgba(225, 48, 108, 0.1)",
                color: "#E1306C",
                zIndex: 10
              }}
              whileTap={{ scale: 0.95 }}
              className="p-4 rounded-2xl bg-[#0f172a] border border-gray-800 text-gray-300 transition-all duration-300 shadow-lg relative group"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Instagram className="w-7 h-7 transition-transform duration-300 group-hover:scale-125 group-hover:drop-shadow-[0_0_8px_rgba(225,48,108,0.8)]" style={{ transform: "translateZ(40px)" }} />
            </motion.a>
            <motion.a
              href="https://github.com/tiekiran2008"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ 
                scale: 1.15, 
                y: -8, 
                rotateX: 15, 
                rotateY: -15, 
                boxShadow: "0 20px 40px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 255, 255, 0.3)",
                borderColor: "rgba(255, 255, 255, 0.8)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                zIndex: 10
              }}
              whileTap={{ scale: 0.95 }}
              className="p-4 rounded-2xl bg-[#0f172a] border border-gray-800 text-gray-300 transition-all duration-300 shadow-lg relative group"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Github className="w-7 h-7 transition-transform duration-300 group-hover:scale-125 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ transform: "translateZ(40px)" }} />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/e-kiran-kumar-24a27b372?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ 
                scale: 1.15, 
                y: -8, 
                rotateX: 15, 
                rotateY: -15, 
                boxShadow: "0 20px 40px rgba(10, 102, 194, 0.6), 0 0 20px rgba(10, 102, 194, 0.4)",
                borderColor: "rgba(10, 102, 194, 0.8)",
                backgroundColor: "rgba(10, 102, 194, 0.1)",
                color: "#0A66C2",
                zIndex: 10
              }}
              whileTap={{ scale: 0.95 }}
              className="p-4 rounded-2xl bg-[#0f172a] border border-gray-800 text-gray-300 transition-all duration-300 shadow-lg relative group"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Linkedin className="w-7 h-7 transition-transform duration-300 group-hover:scale-125 group-hover:drop-shadow-[0_0_8px_rgba(10,102,194,0.8)]" style={{ transform: "translateZ(40px)" }} />
            </motion.a>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-gray-800 hover:border-[#00FFAB]/30 transition-all duration-300 relative overflow-hidden bg-[#0a0f1c]/80">
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-400 block">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full bg-[#05070A] border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-800 focus:border-[#00FFAB] focus:ring-[#00FFAB]'} rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 transition-all`}
                placeholder="Enter your name here..."
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-400 block">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full bg-[#05070A] border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-800 focus:border-[#00FFAB] focus:ring-[#00FFAB]'} rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 transition-all`}
                placeholder="Enter your gmail here..."
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-400 block">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                rows={4}
                className={`w-full bg-[#05070A] border ${errors.message ? 'border-red-500 focus:ring-red-500' : 'border-gray-800 focus:border-[#00FFAB] focus:ring-[#00FFAB]'} rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-1 transition-all resize-none`}
                placeholder="Your message here..."
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-4 rounded-xl bg-[#00FFAB] text-black font-bold hover:bg-[#00FFFF] transition-all duration-300 shadow-[0_0_20px_rgba(0,255,171,0.2)] hover:shadow-[0_0_30px_rgba(0,255,171,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : isSuccess ? (
                <>
                  <span className="text-xl">✓</span>
                  Sent Successfully
                </>
              ) : (
                <>
                  Send Message <Send className="w-4 h-4 ml-1" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100] p-5 bg-[#0a0f1c]/95 backdrop-blur-md border border-[#00FFAB]/50 rounded-2xl shadow-[0_10px_40px_rgba(0,255,171,0.2)] flex items-center gap-4 min-w-[300px]"
          >
            <div className="w-10 h-10 rounded-full bg-[#00FFAB]/20 flex items-center justify-center text-[#00FFAB] shadow-[0_0_15px_rgba(0,255,171,0.3)]">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[#00FFAB] font-bold text-lg">Message Sent!</p>
              <p className="text-gray-300 text-sm">I'll get back to you shortly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
};

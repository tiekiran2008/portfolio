import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mouse position tracking for 3D effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement
  const springConfig = { damping: 25, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Transform mouse position into rotation values
  // Bends away from the mouse cursor
  const rotateX = useTransform(smoothMouseY, [-1, 1], [10, -10]);
  const rotateY = useTransform(smoothMouseX, [-1, 1], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position between -1 and 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Make canvas slightly larger to prevent edges showing during 3D rotation
    let width = window.innerWidth * 1.2;
    let height = window.innerHeight * 1.2;
    canvas.width = width;
    canvas.height = height;

    const characters = '01';
    const fontSize = 14;
    const columns = width / fontSize;
    const drops: number[] = [];

    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 7, 10, 0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00FFAB';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      width = window.innerWidth * 1.2;
      height = window.innerHeight * 1.2;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const codeSnippets = [
    "def train_model(data):",
    "import tensorflow as tf",
    "const agent = new AutonomousAgent();",
    "await model.predict(input)",
    "npm run build",
    "docker-compose up -d",
    "SELECT * FROM neural_weights",
    "class NeuralNet(nn.Module):"
  ];

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none" style={{ perspective: '1000px' }}>
      <motion.div 
        className="absolute inset-[-10%] w-[120%] h-[120%]"
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center'
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 opacity-20 mix-blend-screen w-full h-full" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHYxSDB6bTAgNDBWMGgxdjQweiIgZmlsbD0icmdiYSgwLCAyNTUsIDE3MSwgMC4wNSkiLz4KPC9zdmc+')] opacity-30 mix-blend-screen w-full h-full" />
        
        {/* Floating Code Snippets */}
        {codeSnippets.map((snippet, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: Math.random() * window.innerHeight * 1.2, x: Math.random() * window.innerWidth * 1.2 }}
            animate={{ 
              opacity: [0, 0.1, 0],
              y: [null, Math.random() * window.innerHeight * 1.2],
              x: [null, Math.random() * window.innerWidth * 1.2]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute font-mono text-[#00FFFF] text-xs whitespace-nowrap"
            style={{ translateZ: Math.random() * 100 + 50 }} // Add depth to snippets
          >
            {snippet}
          </motion.div>
        ))}

        {/* Glitch Overlay */}
        <div className="absolute inset-0 opacity-5 mix-blend-overlay animate-glitch bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiAvPgo8L3N2Zz4=')] w-full h-full" />
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(0,255,171,0.02)] to-transparent h-[2px] w-full animate-[scan_4s_linear_infinite]" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070A] via-transparent to-[#05070A] opacity-80" />
    </div>
  );
};

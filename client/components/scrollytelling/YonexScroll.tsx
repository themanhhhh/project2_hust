'use client';

import { useRef, useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const FRAME_COUNT = 40;
const IMAGES_PATH = '/frame/ezgif-frame-';

export default function YonexScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll progress tracking - only active after mount
  const { scrollYProgress } = useScroll({
    target: isMounted ? containerRef : undefined,
    offset: ['start start', 'end end'],
  });

  // Smooth spring animation for frame index
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Transform scroll progress to frame index
  const frameIndex = useTransform(smoothProgress, [0, 1], [0, FRAME_COUNT - 1]);

  // Preload images on mount
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages: HTMLImageElement[] = [];
    
    const loadImage = (index: number): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = `${IMAGES_PATH}${String(index).padStart(3, '0')}.jpg`;
        img.onload = () => {
          loadedImages[index - 1] = img;
          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
          resolve();
        };
        img.onerror = () => resolve();
      });
    };

    const loadAllImages = async () => {
      const promises = [];
      for (let i = 1; i <= FRAME_COUNT; i++) {
        promises.push(loadImage(i));
      }
      await Promise.all(promises);
      setImages(loadedImages);
      setIsLoading(false);
    };

    loadAllImages();
  }, []);

  // Draw frame to canvas
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = images[index];

    if (!canvas || !ctx || !img) return;

    // Set canvas size to match container
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Calculate image dimensions to maintain aspect ratio (contain fit)
    const imgAspect = img.width / img.height;
    const canvasAspect = rect.width / rect.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgAspect > canvasAspect) {
      // Image is wider
      drawWidth = rect.width;
      drawHeight = rect.width / imgAspect;
      drawX = 0;
      drawY = (rect.height - drawHeight) / 2;
    } else {
      // Image is taller
      drawHeight = rect.height;
      drawWidth = rect.height * imgAspect;
      drawX = (rect.width - drawWidth) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }, [images]);

  // Update canvas on scroll
  useEffect(() => {
    if (images.length === 0) return;

    const unsubscribe = frameIndex.on('change', (latest) => {
      const index = Math.min(Math.max(0, Math.round(latest)), FRAME_COUNT - 1);
      drawFrame(index);
    });

    // Draw initial frame
    drawFrame(0);

    return () => unsubscribe();
  }, [frameIndex, drawFrame, images]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (images.length > 0) {
        const currentIndex = Math.round(frameIndex.get());
        drawFrame(currentIndex);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawFrame, frameIndex, images]);

  // Text overlay opacity transforms
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const text1Opacity = useTransform(scrollYProgress, [0.2, 0.3, 0.4, 0.5], [0, 1, 1, 0]);
  const text2Opacity = useTransform(scrollYProgress, [0.45, 0.55, 0.65, 0.75], [0, 1, 1, 0]);
  const text3Opacity = useTransform(scrollYProgress, [0.75, 0.85, 0.95, 1], [0, 1, 1, 1]);

  // Loading screen
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#1a1a1a] flex flex-col items-center justify-center z-50">
        <div className="relative w-24 h-24 mb-8">
          {/* Animated spinner */}
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div 
            className="absolute inset-0 border-4 border-transparent border-t-white rounded-full animate-spin"
            style={{ animationDuration: '1s' }}
          ></div>
        </div>
        <div className="text-white/60 text-sm font-light tracking-widest uppercase mb-4">
          Loading Experience
        </div>
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-white/60 to-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-white/40 text-xs mt-2">{loadingProgress}%</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative h-[400vh] bg-[#1a1a1a]"
    >
      {/* Sticky Canvas */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
        
        {/* Text Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Title - 0% */}
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ opacity: titleOpacity }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white/90"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              YONEX
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-white/60 tracking-widest uppercase mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Pure Performance
            </motion.p>
            <motion.div
              className="mt-12 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
            >
              <span className="text-white/40 text-xs tracking-widest uppercase mb-2">Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Text 1 - 30% */}
          <motion.div 
            className="absolute inset-0 flex items-center px-8 md:px-16 lg:px-24"
            style={{ opacity: text1Opacity }}
          >
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white/90 mb-4">
                Precision Engineering
              </h2>
              <p className="text-base md:text-lg text-white/60 leading-relaxed">
                Every Yonex racket is crafted with nanometric precision. 
                The perfect balance of power and control.
              </p>
            </div>
          </motion.div>

          {/* Text 2 - 60% */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-end px-8 md:px-16 lg:px-24"
            style={{ opacity: text2Opacity }}
          >
            <div className="max-w-xl text-right">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white/90 mb-4">
                Isometric Frame
              </h2>
              <p className="text-base md:text-lg text-white/60 leading-relaxed">
                Revolutionary square-head design creates a 32% larger sweet spot 
                for devastating smashes and precise drops.
              </p>
            </div>
          </motion.div>

          {/* Text 3 - 90% CTA */}
          <motion.div 
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ opacity: text3Opacity }}
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white/90 mb-6 text-center">
              Play Beyond Limits
            </h2>
            <motion.button
              className="px-8 py-4 bg-white text-black font-semibold text-lg tracking-wide rounded-full 
                         hover:bg-white/90 transition-all duration-300 pointer-events-auto
                         hover:scale-105 active:scale-95"
              whileHover={{ boxShadow: "0 0 40px rgba(255,255,255,0.3)" }}
            >
              Shop Collection
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

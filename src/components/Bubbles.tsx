'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

const Bubbles = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const createBubble = useCallback(() => {
    const newBubble: Bubble = {
      id: Date.now() + Math.random(),
      x: Math.random() * 100,
      y: 110,
      size: 20 + Math.random() * 60,
      duration: 10 + Math.random() * 10,
    };
    setBubbles((prev) => [...prev, newBubble]);
  }, []);

  const handlePop = useCallback((id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (bubbles.length < 15) {
        createBubble();
      }
    }, 1000); // Create a new bubble every second

    return () => clearInterval(interval);
  }, [bubbles.length, createBubble]);

  return (
    <div className="bubble-container pointer-events-none">
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute rounded-full bg-white/20 pointer-events-auto cursor-pointer"
            style={{
              left: `${bubble.x}%`,
              width: bubble.size,
              height: bubble.size,
            }}
            initial={{ y: '110vh', opacity: 1 }}
            animate={{ y: '-10vh' }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: bubble.duration,
              ease: 'linear',
            }}
            onViewportLeave={() => handlePop(bubble.id)}
            onPointerDown={() => handlePop(bubble.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Bubbles;

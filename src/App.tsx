/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const VIDEO_URL = '/videos/robot_fast.mp4';
const FALLBACK_VIDEO_URL = '/videos/robot_clean.mp4';

// Chapters for the sequential bottom-to-top scroll transition
const CHAPTERS = [
  {
    id: 1,
    kicker: 'Fluid Dynamics Platform',
    leadIn: 'Simulate the',
    wordLeft: 'FL',
    wordRight: 'OW',
    name: 'FLOW',
  },
  {
    id: 2,
    kicker: 'Digital Wind Tunnel',
    leadIn: 'Governing the',
    wordLeft: 'AE',
    wordRight: 'RO',
    name: 'AERO',
  },
  {
    id: 3,
    kicker: 'Solver Engine',
    leadIn: 'Command the',
    wordLeft: 'WI',
    wordRight: 'ND',
    name: 'WIND',
  },
  {
    id: 4,
    kicker: 'Aerodynamic Workflow',
    leadIn: 'Mastering',
    wordLeft: 'CO',
    wordRight: 'RE',
    name: 'CORE',
  },
];

export default function App() {
  const [videoSrc, setVideoSrc] = useState<string>(VIDEO_URL);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [characterXOffset, setCharacterXOffset] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetTimeRef = useRef<number>(0);

  // Synchronize video playback with user scroll without frame drops
  const syncVideoTime = useCallback(() => {
    const video = videoRef.current;
    if (video && video.duration && !Number.isNaN(video.duration)) {
      const diff = targetTimeRef.current - video.currentTime;
      if (Math.abs(diff) > 0.015) {
        const vid = video as HTMLVideoElement & { fastSeek?: (time: number) => void };
        if (typeof vid.fastSeek === 'function') {
          try {
            vid.fastSeek(targetTimeRef.current);
          } catch {
            video.currentTime = targetTimeRef.current;
          }
        } else {
          video.currentTime = targetTimeRef.current;
        }
      }
    }
  }, []);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const progress = Math.max(0, Math.min(1, currentScrollY / maxScroll));
    setScrollProgress(progress);

    const video = videoRef.current;
    if (video && video.duration && !Number.isNaN(video.duration)) {
      targetTimeRef.current = progress * video.duration;
      syncVideoTime();
    }

    // Natural character sway tracking: follows the character's walking stride
    const sway = Math.sin(progress * Math.PI * 6) * 14;
    setCharacterXOffset(sway);
  }, [syncVideoTime]);

  useEffect(() => {
    let animId: number;

    const onScroll = () => {
      handleScroll();
    };

    const loop = () => {
      syncVideoTime();
      animId = requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onScroll, { passive: true });
    handleScroll();
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onScroll);
      cancelAnimationFrame(animId);
    };
  }, [handleScroll, syncVideoTime]);

  // Virtual index for sequential chapter transitions (0 to 3)
  const virtualIndex = scrollProgress * (CHAPTERS.length - 1);
  const activeChapterIndex = Math.min(
    CHAPTERS.length - 1,
    Math.round(virtualIndex)
  );
  const currentChapter = CHAPTERS[activeChapterIndex] || CHAPTERS[0];

  return (
    <div className="relative w-full text-white select-none overflow-x-hidden font-body bg-black">
      {/* 
        Full-Screen Background Video
        Synchronized with scroll for real-time character walk
      */}
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        onError={() => {
          if (videoSrc !== FALLBACK_VIDEO_URL) {
            setVideoSrc(FALLBACK_VIDEO_URL);
          }
        }}
        onLoadedMetadata={() => {
          handleScroll();
        }}
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />

      {/* 
        TOP-LEFT: CHAPTER LEAD-IN
        Charcoal Black / Platinum tone, transparent, zero backgrounds, no symbols
      */}
      <div 
        className="fixed top-8 sm:top-12 left-6 sm:left-12 z-20 pointer-events-none flex flex-col items-start"
        style={{
          filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.95))',
        }}
      >
        <div 
          className="text-xs font-mono uppercase tracking-widest mb-1 text-[#181B20]"
          style={{
            WebkitTextStroke: '0.4px rgba(225, 235, 245, 0.9)',
            textShadow: '0 0 10px rgba(240, 245, 255, 0.45)',
          }}
        >
          {currentChapter.kicker}
        </div>
        <div 
          className="text-3xl sm:text-5xl md:text-6xl font-serif italic tracking-wide text-[#121519]"
          style={{
            WebkitTextStroke: '1px rgba(240, 245, 255, 0.95)',
            textShadow: '0 0 18px rgba(240, 245, 255, 0.5), 0 4px 12px rgba(0, 0, 0, 0.95)',
          }}
        >
          {currentChapter.leadIn}
        </div>
      </div>

      {/* 
        MONUMENTAL MIDDLE TEXT WITH SEQUENTIAL VERTICAL SCROLL:
        - When scrolling down: active text moves UP and fades out (transparent).
        - Next text arrives from DOWN and moves UP into center.
        - When scrolling up: previous text comes DOWN into center.
        - Enlarged typography in Charcoal Black / Platinum Black.
        - Left side (2 letters): closer to the main character.
        - Right side (2 letters): space on the right side.
        - Text dynamically follows character sway.
      */}
      <div 
        className="fixed inset-0 pointer-events-none z-10 overflow-hidden"
        aria-label="Aerodynamics Chapters"
      >
        {CHAPTERS.map((ch, idx) => {
          const delta = idx - virtualIndex;
          // Only render chapters that are within visible range to optimize GPU
          if (Math.abs(delta) > 1.25) return null;

          // Vertical displacement: delta < 0 moves UP (-), delta > 0 moves DOWN (+)
          const yShiftPercent = delta * 125;
          // Smooth fade in and out as it leaves/enters the center
          const opacity = Math.max(0, Math.min(1, 1 - Math.abs(delta) * 1.5));

          return (
            <div
              key={ch.id}
              className="absolute inset-0 pointer-events-none will-change-transform"
              style={{
                transform: `translateY(${yShiftPercent}%)`,
                opacity,
                transition: 'opacity 0.08s linear',
              }}
            >
              {/* Left Pair: 2 letters closer to the main character */}
              <div 
                className="absolute top-1/2 flex items-center justify-end select-none will-change-transform"
                style={{
                  right: `calc(100% - 47% - ${characterXOffset}px)`,
                  transform: 'translateY(-50%)',
                }}
              >
                <span 
                  className="text-[120px] sm:text-[180px] md:text-[240px] lg:text-[300px] xl:text-[360px] font-black tracking-normal leading-none text-right inline-block text-[#111317]"
                  style={{
                    fontFamily: 'Impact, "Helvetica Neue", "Arial Black", sans-serif',
                    WebkitTextStroke: '2px rgba(235, 240, 250, 0.9)',
                    textShadow: '0 0 45px rgba(240, 245, 255, 0.45), 0 10px 40px rgba(0, 0, 0, 0.95)',
                  }}
                >
                  {ch.wordLeft}
                </span>
              </div>

              {/* Right Pair: 2 letters spaced out on right side */}
              <div 
                className="absolute top-1/2 flex items-center justify-start select-none will-change-transform"
                style={{
                  left: `calc(68% + ${characterXOffset}px)`,
                  transform: 'translateY(-50%)',
                }}
              >
                <span 
                  className="text-[120px] sm:text-[180px] md:text-[240px] lg:text-[300px] xl:text-[360px] font-black tracking-normal leading-none text-left inline-block text-[#111317]"
                  style={{
                    fontFamily: 'Impact, "Helvetica Neue", "Arial Black", sans-serif',
                    WebkitTextStroke: '2px rgba(235, 240, 250, 0.9)',
                    textShadow: '0 0 45px rgba(240, 245, 255, 0.45), 0 10px 40px rgba(0, 0, 0, 0.95)',
                  }}
                >
                  {ch.wordRight}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 
        BOTTOM-LEFT CORNER: COMPUTER DYNAMIC FLUIDS BASICS
        Charcoal Black / Platinum text, zero backgrounds, no symbols
      */}
      <div 
        className="fixed bottom-8 left-6 sm:left-12 z-20 max-w-sm pointer-events-none"
        aria-label="Computer Dynamic Fluids Basics"
      >
        <div className="flex flex-col gap-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          <h2 
            className="text-sm font-bold tracking-wide uppercase text-[#14171C]"
            style={{
              WebkitTextStroke: '0.6px rgba(235, 240, 250, 0.95)',
              textShadow: '0 0 10px rgba(240, 245, 255, 0.45)',
            }}
          >
            Computer Dynamic Fluids
          </h2>
          <p 
            className="text-xs leading-relaxed font-semibold text-[#181B20]"
            style={{
              WebkitTextStroke: '0.35px rgba(230, 238, 248, 0.9)',
              textShadow: '0 1px 4px rgba(0, 0, 0, 0.9)',
            }}
          >
            A digital fluid dynamics platform simulating airflow behavior, aerodynamic forces, and pressure velocity distribution around complex surfaces in real time.
          </p>
        </div>
      </div>

      {/* 
        BOTTOM CREDITS (REVEALED WHEN SCROLLING DOWN):
        Website admin, developer, and contact email
        Charcoal Black / Platinum text, zero backgrounds, no symbols
      */}
      <div 
        className={`fixed bottom-8 right-6 sm:right-12 z-20 transition-opacity duration-300 pointer-events-auto ${
          scrollProgress > 0.65 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-1 text-right text-xs font-mono drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          <div>
            <span 
              className="text-[#14171C] font-bold"
              style={{
                WebkitTextStroke: '0.4px rgba(230, 238, 248, 0.85)',
              }}
            >
              Website Admin:{' '}
            </span>
            <span 
              className="text-[#121519] font-black text-sm"
              style={{
                WebkitTextStroke: '0.7px rgba(240, 245, 255, 0.95)',
                textShadow: '0 0 8px rgba(240, 245, 255, 0.4)',
              }}
            >
              RIM
            </span>
          </div>

          <div>
            <span 
              className="text-[#14171C] font-bold"
              style={{
                WebkitTextStroke: '0.4px rgba(230, 238, 248, 0.85)',
              }}
            >
              Website Developer:{' '}
            </span>
            <span 
              className="text-[#121519] font-black text-sm"
              style={{
                WebkitTextStroke: '0.7px rgba(240, 245, 255, 0.95)',
                textShadow: '0 0 8px rgba(240, 245, 255, 0.4)',
              }}
            >
              AKHIL
            </span>
          </div>

          <div>
            <span 
              className="text-[#14171C] font-bold"
              style={{
                WebkitTextStroke: '0.4px rgba(230, 238, 248, 0.85)',
              }}
            >
              Contact Email:{' '}
            </span>
            <a 
              href="mailto:akkeduc01@gmail.com" 
              className="text-[#121519] font-bold hover:underline cursor-pointer"
              style={{
                WebkitTextStroke: '0.5px rgba(240, 245, 255, 0.95)',
              }}
            >
              akkeduc01@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* 
        Scroll Track:
        320vh container driving the continuous sequential scroll animation
      */}
      <div 
        className="relative w-full h-[320vh] pointer-events-none" 
        aria-hidden="true" 
      />
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import type { Route } from "./+types/home";
import DirtBikeGame from "../components/DirtBikeGame";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Daddy Bruce - Portfolio" },
    { name: "description", content: "Deaf creator, software engineer, VRChat regular. Building Yapper — a better way to connect." },
    { name: "keywords", content: "Daddy Bruce, software engineer, VRChat, Yapper, deaf creator, portfolio" },
    { name: "theme-color", content: "#000000" },
  ];
}

// Social media links data
const socialLinks = [
  { name: "Discord", url: "https://discord.gg/2XxkfX8NSg" },
  { name: "Twitter", url: "https://x.com/ADDaddyBruce" },
  { name: "TikTok", url: "https://www.tiktok.com/@the_daddybruce" },
  { name: "YouTube", url: "https://www.youtube.com/@Daddy_Bruce" },
  { name: "Twitch", url: "https://www.twitch.tv/the_daddybruce" },
  { name: "Bluesky", url: "https://bsky.app/profile/daddybruce.bsky.social" },
];

// Custom hook to detect when element enters viewport using Intersection Observer
function useOnScreen(ref: React.RefObject<HTMLElement>, threshold = 0.3) {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          // Disconnect observer after first intersection to prevent re-triggering
          observer.unobserve(ref.current!);
        }
      },
      { 
        threshold,
        rootMargin: "0px 0px -100px 0px" // Trigger slightly before element is fully visible
      }
    );

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, threshold]);

  return isIntersecting;
}

export default function Home() {
  // Refs for sections to observe
  const introRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLElement>(null);
  const gameRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  // Track visibility state for each section
  const introVisible = useOnScreen(introRef);
  const linksVisible = useOnScreen(linksRef);
  const gameVisible = useOnScreen(gameRef);

  // Scroll-based avatar fade effect
  const [avatarOpacity, setAvatarOpacity] = useState(1);
  // Scroll-based hero text and arrow fade effect
  const [heroTextOpacity, setHeroTextOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      
      const scrollY = window.scrollY;
      const heroHeight = heroRef.current.offsetHeight;
      
      // Calculate opacity based on scroll position for avatar
      // Fade starts immediately and completes at 60% of hero height
      const fadePoint = heroHeight * 0.6;
      const avatarOpacity = Math.max(0, 1 - (scrollY / fadePoint));
      setAvatarOpacity(avatarOpacity);

      // Calculate opacity for hero text and scroll arrow (fade over first 300px)
      const heroTextOpacity = Math.max(0, 1 - (scrollY / 300));
      setHeroTextOpacity(heroTextOpacity);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Shooting stars effect
  useEffect(() => {
    const createShootingStar = () => {
      console.log('Creating shooting star...'); // Debug log
      const star = document.createElement('div');
      star.className = 'shooting-star';
      
      // Random vertical position (10% to 70% of viewport height)
      const topPosition = Math.random() * 60 + 10; // 10% to 70%
      star.style.top = `${topPosition}%`;
      
      // Use fixed duration for now
      const duration = 4; // 4 seconds
      star.style.animationDuration = `${duration}s`;
      
      document.body.appendChild(star);
      console.log('Shooting star added to DOM at', topPosition + '%'); // Debug log
      
      // Remove the star after animation completes
      setTimeout(() => {
        if (star.parentNode) {
          star.parentNode.removeChild(star);
          console.log('Shooting star removed from DOM'); // Debug log
        }
      }, duration * 1000 + 100); // Add small buffer
    };

    const spawnShootingStars = () => {
      console.log('Spawning shooting stars...'); // Debug log
      // Always spawn 1 star for testing
      const count = 1;
      
      for (let i = 0; i < count; i++) {
        // Slight delay between multiple stars
        setTimeout(() => {
          createShootingStar();
        }, i * 500); // 500ms delay between stars
      }
    };

    // Initial delay before first shooting star (1 second for testing)
    const initialTimeout = setTimeout(spawnShootingStars, 1000);
    
    // Then every 10 seconds for testing (instead of 40)
    const interval = setInterval(spawnShootingStars, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  // Glitch effect for hero title on page load
  useEffect(() => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
      // Add glitch class immediately on page load
      heroTitle.classList.add('glitch');
      
      // Remove glitch class after animation completes (1.5s)
      const glitchTimeout = setTimeout(() => {
        heroTitle.classList.remove('glitch');
      }, 1500);

      return () => {
        clearTimeout(glitchTimeout);
      };
    }
  }, []);

  // Section divider animation on scroll
  useEffect(() => {
    const dividers = document.querySelectorAll('.section-divider');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is fully visible
    });

    dividers.forEach(div => observer.observe(div));

    return () => {
      dividers.forEach(div => observer.unobserve(div));
    };
  }, []);



  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* Floating Particles Overlay */}
      <div id="particles" className="particles-container">
        {/* Generate multiple floating particles */}
        {[...Array(25)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>
      {/* Hero Section with Enhanced Styling */}
      <header
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center hero-section"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 hero-gradient-bg z-0" />
        
        {/* Right-Side Avatar */}
        <div 
          className="hero-avatar"
          style={{ 
            opacity: avatarOpacity,
            position: 'absolute',
            right: '-100px',
            top: '5%',
            height: '90%',
            width: '450px',
            zIndex: 15,
            pointerEvents: 'none'
          }}
        >
          <img
            src="/images/avatar-bg.png"
            alt=""
            className="w-full h-full object-contain object-center"
            aria-hidden="true"
          />
        </div>
        
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10" />
        
        {/* Content Container - Fixed Position */}
        <div 
          ref={introRef}
          className={`hero-text relative z-20 flex flex-col items-center justify-center px-6 py-12 text-center transition-all duration-1000 ease-out transform ${
            introVisible 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-10"
          }`}
          style={{ opacity: heroTextOpacity }}
        >
          {/* Main heading with serif font */}
          <h1 className="hero-title font-serif text-6xl md:text-8xl lg:text-9xl font-bold text-red-accent mb-6 leading-tight tracking-tight">
            Daddy Bruce
          </h1>
          
          {/* Tagline */}
          <p className="font-sans text-lg md:text-xl lg:text-2xl text-white mb-4 font-light tracking-wide">
            Deaf creator, software engineer, VRChat regular
          </p>
          
          {/* Sub-tagline */}
          <p className="font-sans text-sm md:text-base text-gray-400 italic mb-12 font-light">
            Building Yapper — a better way to connect
          </p>
          
          {/* About paragraph */}
          <div className="max-w-3xl mb-16">
            <p className="font-sans text-base md:text-lg leading-relaxed text-gray-100 font-light">
              Yo, I'm Daddy Bruce — Deaf, into code, and always up to something. I'm building{" "}
              <span className="text-red-accent font-bold">Yapper</span>, a chill social app for 
              furries, LGBTQ+ folks, and anyone just looking for a space that actually feels good. 
              Most days I'm either grinding code, dirt biking, or vibing full-body in VRChat. 
              I'm all about good energy, real people, and making cool stuff happen.
            </p>
          </div>
        </div>

        {/* Enhanced Scroll Down Indicator */}
        <div 
          className={`scroll-arrow absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-700 ease-out delay-500 ${
            introVisible 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          }`}
          style={{ opacity: heroTextOpacity }}
        >
          <a
            href="#social"
            aria-label="Scroll down to see social media links"
            className="group flex flex-col items-center text-red-accent hover:text-red-hover focus:text-red-hover focus:outline-none focus:ring-2 focus:ring-red-accent focus:ring-opacity-50 rounded-lg p-3 transition-all duration-300 scroll-arrow-link"
          >
            {/* Simple Down Arrow SVG Icon */}
            <svg
              className="w-8 h-8 md:w-10 md:h-10 animate-bounce group-hover:animate-pulse group-focus:animate-pulse mb-2"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
                clipRule="evenodd"
              />
            </svg>
            
            {/* Scroll Down Label */}
            <span className="text-sm md:text-base font-sans font-medium tracking-wide group-hover:text-red-hover transition-colors duration-300">
              Scroll down
            </span>
          </a>
        </div>
      </header>

      {/* Social Links Section */}
      <section
        id="social"
        ref={linksRef}
        className={`relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12 transition-all duration-700 ease-out transform ${
          linksVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-10"
        }`}
      >
        {/* Section Divider */}
        <div className="section-divider w-full max-w-4xl"></div>
        {/* Social Media Title */}
        <div className={`mb-12 transition-all duration-700 ease-out transform delay-200 ${
          linksVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-10"
        }`}>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-red-accent text-center tracking-tight">
            My social medias
          </h2>
        </div>

        <nav 
          className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl"
          role="navigation"
          aria-label="Social media profiles"
        >
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${link.name} profile`}
              className="
                group relative overflow-hidden
                border-2 border-red-accent bg-transparent text-white
                font-sans font-semibold text-sm md:text-base
                px-6 py-3 md:px-8 md:py-4
                transition-all duration-300 ease-in-out
                hover:scale-110 hover:shadow-lg hover:shadow-red-accent/25
                focus:scale-110 focus:outline-none focus:ring-4 focus:ring-red-accent focus:ring-opacity-50
                active:scale-95
              "
            >
              {/* Background fill animation */}
              <span className="
                absolute inset-0 bg-red-accent transform scale-x-0 origin-left
                transition-transform duration-300 ease-in-out
                group-hover:scale-x-100 group-focus:scale-x-100
                -z-10
              "></span>
              
              {/* Button text */}
              <span className="relative z-10 transition-colors duration-300">
                {link.name}
              </span>
            </a>
          ))}
        </nav>

        {/* Arrow to Game Section - Fixed to bottom */}
        <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out delay-600 ${
          linksVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-4"
        }`}>
          <button
            onClick={() => {
              const gameSection = document.querySelector('[aria-label*="dirt bike game"]')?.closest('section');
              gameSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Scroll down to play the dirt bike mini-game"
            className="group flex flex-col items-center text-red-accent hover:text-red-hover focus:text-red-hover focus:outline-none focus:ring-2 focus:ring-red-accent focus:ring-opacity-50 rounded-lg p-3 transition-colors duration-300"
          >
            {/* Downward Arrow */}
            <svg
              className="w-8 h-8 md:w-10 md:h-10 animate-bounce group-hover:animate-pulse group-focus:animate-pulse mb-2"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
                clipRule="evenodd"
              />
            </svg>
            
            {/* Label */}
            <span className="text-white font-bold text-lg md:text-xl font-sans tracking-wide group-hover:text-gray-200 transition-colors duration-300">
              Mini Game!
            </span>
            
            {/* Subtitle */}
            <span className="text-gray-400 text-xs md:text-sm font-sans mt-1 opacity-75 group-hover:opacity-100 transition-opacity duration-300">
              🏍️ Try my dirt bike jump game
            </span>
          </button>
        </div>
      </section>

      {/* Game Section */}
      <section
        ref={gameRef}
        className={`relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12 transition-all duration-700 ease-out transform ${
          gameVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-10"
        }`}
      >
        {/* Section Divider */}
        <div className="section-divider w-full max-w-4xl"></div>
        {/* Game Title */}
        <div className={`mb-12 transition-all duration-700 ease-out transform delay-200 ${
          gameVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-10"
        }`}>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-red-accent text-center tracking-tight mb-4">
            Play My Game
          </h2>
          <p className="font-sans text-base md:text-lg text-gray-300 text-center max-w-2xl">
            I love dirt biking in real life, so I built this little game! 
            See how many obstacles you can jump over. Use spacebar or click to jump!
          </p>
        </div>

        {/* Game Component */}
        <div className={`transition-all duration-700 ease-out transform delay-400 ${
          gameVisible 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 translate-y-10"
        }`}>
          <DirtBikeGame />
        </div>
      </section>

      {/* Hidden footer for screen readers */}
      <footer className="sr-only">
        <p>Portfolio website of Daddy Bruce, software engineer and content creator</p>
      </footer>
    </div>
  );
}
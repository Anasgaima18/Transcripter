import React from 'react';
import { Link } from 'react-router-dom';
import PremiumButton from '../components/ui/PremiumButton';
import GlassCard from '../components/ui/GlassCard';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative selection:bg-primary/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
              T
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
              Transcripter
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <PremiumButton variant="ghost">Sign In</PremiumButton>
            </Link>
            <Link to="/signup">
              <PremiumButton variant="primary">Get Started</PremiumButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">New: Real-time Transcription</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight animate-slide-in">
            Transform Your Voice <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              Into Text, Instantly
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-in delay-100">
            Experience the future of speech-to-text. Record in real-time, detect languages automatically,
            and manage your transcriptions with a beautiful, intuitive interface.
          </p>

          <div className="flex flex-wrap justify-center gap-4 animate-slide-in delay-200">
            <Link to="/signup">
              <PremiumButton variant="gradient" className="text-lg px-8 py-4 h-auto">
                Start Transcribing Free
              </PremiumButton>
            </Link>
            <Link to="/login">
              <PremiumButton variant="glass" className="text-lg px-8 py-4 h-auto">
                View Demo
              </PremiumButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard hoverEffect className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl">
                🎙️
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Recording</h3>
              <p className="text-muted-foreground">
                Record directly in your browser with high-fidelity audio capture and instant feedback.
              </p>
            </GlassCard>

            <GlassCard hoverEffect className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-500/10 flex items-center justify-center text-3xl">
                🌍
              </div>
              <h3 className="text-xl font-bold mb-3">Multi-language</h3>
              <p className="text-muted-foreground">
                Support for 13+ languages including Hindi, Tamil, Telugu, and more with high accuracy.
              </p>
            </GlassCard>

            <GlassCard hoverEffect className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-pink-500/10 flex items-center justify-center text-3xl">
                ⚡
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Export</h3>
              <p className="text-muted-foreground">
                Download your transcripts in multiple formats or share them instantly with your team.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎧</span>
            <span className="font-bold text-lg">Transcripter</span>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2025 Transcripter. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

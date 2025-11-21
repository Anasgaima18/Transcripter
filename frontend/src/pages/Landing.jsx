import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PremiumButton from "../components/ui/PremiumButton";
import PremiumCard from "../components/ui/PremiumCard";
// import ThreeBackground from "../components/ThreeBackground";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#050511] text-foreground overflow-hidden relative">
      {/* Global 3D Background */}
      <div className="absolute inset-0 z-0">
        {/* <ThreeBackground /> */}
      </div>

      {/* Navbar */}
      <nav className="relative z-50 container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          <span>🎙️</span> Transcripter
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <PremiumButton variant="ghost" className="text-gray-300 hover:text-white">
              Login
            </PremiumButton>
          </Link>
          <Link to="/signup">
            <PremiumButton variant="primary" className="shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              Get Started
            </PremiumButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <h1 className="text-6xl md:text-7xl font-bold leading-tight text-white drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            Transform Speech into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#7000FF]">
              Perfect Text
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Experience the future of transcription with AI-powered accuracy,
            real-time processing, and a premium interface designed for professionals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link to="/signup">
              <PremiumButton variant="primary" className="px-10 py-4 text-lg shadow-[0_0_30px_rgba(0,240,255,0.4)]">
                Start Transcribing Free
              </PremiumButton>
            </Link>
            <Link to="/login">
              <PremiumButton variant="secondary" className="px-10 py-4 text-lg">
                View Demo
              </PremiumButton>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {[
            {
              icon: "⚡",
              title: "Real-time Processing",
              desc: "Instant transcription with near-zero latency using advanced AI models."
            },
            {
              icon: "🌍",
              title: "Multi-language Support",
              desc: "Support for 11+ Indian languages with auto-detection capabilities."
            },
            {
              icon: "🔒",
              title: "Secure & Private",
              desc: "Enterprise-grade encryption ensures your audio data remains private."
            }
          ].map((feature, idx) => (
            <PremiumCard
              key={idx}
              className="p-8 text-left border-white/5 bg-[#0A0A23]/40 backdrop-blur-md hover:bg-[#0A0A23]/60"
              delay={idx * 0.2}
            >
              <div className="text-4xl mb-6 bg-[#00F0FF]/10 w-16 h-16 rounded-2xl flex items-center justify-center text-[#00F0FF]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </PremiumCard>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#050511]/80 backdrop-blur-xl py-12">
        <div className="container mx-auto px-6 text-center text-gray-500">
          <p>&copy; 2024 Transcripter. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

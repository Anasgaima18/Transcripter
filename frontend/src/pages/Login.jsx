import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import PremiumInput from "../components/ui/PremiumInput";
// import ThreeBackground from "../components/ThreeBackground";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate("/record");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-[#050511] text-foreground overflow-hidden">
      {/* Left Side - 3D Art */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-[#050511]">
        {/* <ThreeBackground /> */}
        <div className="relative z-10 text-center p-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-6 text-[#00F0FF] drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]"
          >
            Welcome Back
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-400 max-w-md mx-auto"
          >
            Access your premium transcription workspace.
          </motion.p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <PremiumCard className="p-10 border-white/5 bg-[#0A0A23]/50 backdrop-blur-3xl">
            <div className="text-center mb-10 lg:hidden">
              <h1 className="text-3xl font-bold text-[#00F0FF] mb-2">Transcripter</h1>
              <p className="text-muted-foreground">Sign in to continue</p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">Sign In</h2>
              <p className="text-gray-400 text-sm">Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <PremiumInput
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
              <PremiumInput
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />

              <PremiumButton
                type="submit"
                variant="primary"
                className="w-full py-4 text-lg shadow-[0_0_20px_rgba(0,240,255,0.3)]"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </PremiumButton>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#00F0FF] hover:text-[#00F0FF]/80 font-medium transition-colors">
                Create account
              </Link>
            </div>
          </PremiumCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

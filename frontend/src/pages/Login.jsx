import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Input, Alert } from "../components/ui";

// Styled Components (ElevenLabs-inspired)
const PageWrap = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f0f23, #1a1a2e, #16213e);
  overflow: hidden;
  position: relative;

  body.light & {
    background: linear-gradient(135deg, #f8fafc, #f1f5f9, #ffffff);
  }

  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
  }

  &::before {
    width: 600px;
    height: 600px;
    top: -200px;
    left: -200px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%);
    animation: float 20s ease-in-out infinite;
  }

  &::after {
    width: 400px;
    height: 400px;
    bottom: -150px;
    right: -150px;
    background: radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%);
    animation: float 15s ease-in-out infinite reverse;
  }

  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(120deg); }
    66% { transform: translate(-20px, 20px) rotate(240deg); }
  }
`;

const Glow = styled(motion.div)`
  position: absolute;
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1));
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;

  body.light & {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.1));
  }
`;

const FormCard = styled(motion.div)`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 28rem;
  padding: 1rem;
`;

const CardInner = styled(Card)`
  padding: 2rem;
  backdrop-filter: blur(20px);
  background: rgba(15, 15, 35, 0.8);
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.5),
              0 0 0 1px rgba(139, 92, 246, 0.1);
  position: relative;
  overflow: hidden;

  body.light & {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(139, 92, 246, 0.15);
    box-shadow: 0 20px 50px rgba(2, 6, 23, 0.15);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
    animation: scan 3s ease-in-out infinite;
  }

  @keyframes scan {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #8b5cf6, #6366f1, #ec4899);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.3));
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #64748b;
  margin-bottom: 1.5rem;

  body.dark & {
    color: #94a3b8;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SignupText = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 1.5rem;

  body.dark & {
    color: #94a3b8;
  }
`;

const SignupLink = styled(Link)`
  color: #4f46e5;
  text-decoration: none;
  font-weight: 600;
  &:hover {
    text-decoration: underline;
  }

  body.dark & {
    color: #a78bfa;
  }
`;

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
    result.success ? navigate("/record") : setError(result.message);
    setLoading(false);
  };

  return (
    <PageWrap>
      <Glow
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
        style={{ top: "-100px", left: "-100px" }}
      />

      <FormCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <CardInner>
          <Title>🎤 Transcripter</Title>
          <Subtitle>Welcome back — sign in to continue.</Subtitle>

          {error && <Alert variant="danger" style={{ marginBottom: "1rem" }}>{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" style={{ width: "100%" }} disabled={loading}>
                {loading ? "⏳ Logging in..." : "🚀 Login"}
              </Button>
            </motion.div>
          </Form>

          <SignupText>
            Don't have an account? <SignupLink to="/signup">Sign up</SignupLink>
          </SignupText>
        </CardInner>
      </FormCard>
    </PageWrap>
  );
};

export default Login;
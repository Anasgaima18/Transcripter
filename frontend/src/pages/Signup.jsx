import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Card, Button, Input, Alert } from "../components/ui";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    const result = await signup(formData.username, formData.email, formData.password);
    
    if (result.success) {
      navigate("/record");
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  // Styled Components
  const PageWrap = styled.div`
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at top left, #eef2ff, #f5f3ff, #fce7f3);
    overflow: hidden;
    position: relative;

    body.dark & {
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    }
  `;

  const Glow = styled(motion.div)`
    position: absolute;
    width: 600px;
    height: 600px;
    background: linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(236, 72, 153, 0.15));
    border-radius: 50%;
    filter: blur(100px);
    z-index: 0;
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
    background: rgba(255, 255, 255, 0.9);

    body.dark & {
      background: rgba(31, 41, 55, 0.9);
      border-color: rgba(75, 85, 99, 0.3);
    }
  `;

  const Title = styled.h1`
    text-align: center;
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(90deg, #7c3aed, #4f46e5, #3b82f6);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 0.5rem;
  `;

  const Subtitle = styled.p`
    text-align: center;
    color: #64748b;
    margin-bottom: 1.5rem;

    body.dark & {
      color: #9ca3af;
    }
  `;

  const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
  `;

  const LoginText = styled.p`
    text-align: center;
    font-size: 0.875rem;
    color: #64748b;
    margin-top: 1.5rem;

    body.dark & {
      color: #9ca3af;
    }
  `;

  const LoginLink = styled(Link)`
    color: #4f46e5;
    text-decoration: none;
    font-weight: 600;
    &:hover {
      text-decoration: underline;
    }
  `;

  return (
    <PageWrap>
      <Glow
        animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 0] }}
        transition={{ duration: 15, repeat: Infinity }}
        style={{ top: "-150px", right: "-150px" }}
      />

      <FormCard
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <CardInner>
          <Title>🎤 Join Transcripter</Title>
          <Subtitle>Create your account to start transcribing.</Subtitle>

          {error && <Alert variant="danger" style={{ marginBottom: "1rem" }}>{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
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
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" style={{ width: "100%" }} disabled={loading}>
                {loading ? "⏳ Creating Account..." : "🚀 Sign Up"}
              </Button>
            </motion.div>
          </Form>

          <LoginText>
            Already have an account? <LoginLink to="/login">Sign in</LoginLink>
          </LoginText>
        </CardInner>
      </FormCard>
    </PageWrap>
  );
};

export default Signup;

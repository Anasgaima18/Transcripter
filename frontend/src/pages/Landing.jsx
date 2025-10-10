// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Navbar from "../components/Navbar";

// ==================== ANIMATIONS ====================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-25px) rotate(2deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// ==================== STYLED COMPONENTS ====================
const PageWrap = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  position: relative;
  overflow-x: hidden;
  color: white;
`;

const BackgroundOrbs = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
`;

const Orb = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
  animation: ${float} 25s ease-in-out infinite;

  &:nth-child(1) {
    width: 600px; height: 600px;
    top: -15%; left: -15%;
    background: linear-gradient(135deg, #667eea, #764ba2);
  }
  &:nth-child(2) {
    width: 500px; height: 500px;
    top: 30%; right: -10%;
    background: linear-gradient(135deg, #f093fb, #f5576c);
    animation-delay: 5s;
  }
  &:nth-child(3) {
    width: 450px; height: 450px;
    bottom: -10%; left: 20%;
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    animation-delay: 10s;
  }
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
`;

// ==================== HERO SECTION ====================
const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 900;
  background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #ec4899 100%);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: ${gradientMove} 5s ease infinite;
`;

const HeroSubtitle = styled.p`
  font-size: clamp(1.1rem, 2vw, 1.4rem);
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  max-width: 700px;
  margin: 1rem auto 3rem auto;
`;

const CTAButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
`;

const PrimaryButton = styled(Link)`
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
  text-decoration: none;
  transition: 0.3s ease;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 50px rgba(102, 126, 234, 0.6);
  }
`;

const SecondaryButton = styled(Link)`
  padding: 1rem 2.5rem;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  text-decoration: none;
  color: #fff;
  font-weight: 600;
  transition: 0.3s ease;
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-3px);
  }
`;

const LanguageSupport = styled.div`
  margin-top: 2rem;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  strong { color: #a78bfa; }
`;

// ==================== MAIN COMPONENT ====================
const Landing = () => {
  return (
    <PageWrap>
      <Navbar />

      <BackgroundOrbs>
        <Orb />
        <Orb />
        <Orb />
      </BackgroundOrbs>

      <Content>
        <HeroTitle>Transform Your Voice into Text, Instantly</HeroTitle>
        <HeroSubtitle>
          Experience the future of speech-to-text with <strong>Transcripter</strong>. 
          Record in real-time, detect languages automatically, and save securely.
        </HeroSubtitle>

        <CTAButtons>
          <PrimaryButton to="/signup">🚀 Start Free Now</PrimaryButton>
          <SecondaryButton to="/login">🔑 Sign In</SecondaryButton>
        </CTAButtons>

        <LanguageSupport>
          <strong>13+ Languages Supported</strong> — Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, and English
        </LanguageSupport>
      </Content>
    </PageWrap>
  );
};

export default Landing;

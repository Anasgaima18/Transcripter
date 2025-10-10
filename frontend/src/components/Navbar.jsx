import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Container, Button, Pill } from './ui';
import styled from 'styled-components';

const NavBarWrap = styled.nav`
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e2e8f0; /* slate-200 */
  box-shadow: 0 1px 6px rgba(2, 6, 23, 0.06);
`;

const ContainerRow = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
`;

const Brand = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-decoration: none;
  color: inherit;
`;

const BrandText = styled.span`
  font-size: 1.125rem; /* ~text-lg */
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  @media (min-width: 640px) { gap: 0.5rem; }
`;

const NavLinkPill = styled(Link)`
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid #e2e8f0; /* slate-200 */
  color: #334155; /* slate-700 */
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
  &:hover { background: #f1f5f9; /* slate-100 */ }
  ${(p) => p.$active && `background:#0f172a; border-color:#0f172a; color:#fff;`}
`;

const UserArea = styled.div`
  display: none;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
  @media (min-width: 640px) { display: inline-flex; }
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <NavBarWrap>
      <ContainerRow>
        <Brand to={user ? "/record" : "/"}>
          <span style={{ fontSize: '1.25rem' }}>🎧</span>
          <BrandText>Transcripter</BrandText>
        </Brand>

        {user && (
          <NavLinks>
            <NavLinkPill to="/record" $active={isActive('/record')}>Record</NavLinkPill>
            <NavLinkPill to="/dashboard" $active={isActive('/dashboard')}>Dashboard</NavLinkPill>
            <UserArea>
              <Pill>{user.username}</Pill>
              <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
            </UserArea>
          </NavLinks>
        )}
      </ContainerRow>
    </NavBarWrap>
  );
};

export default Navbar;

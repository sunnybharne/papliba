import { useEffect, useState, type MouseEvent } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { navigation, product } from '../content/product';
import { Brand } from './Brand';
import { CloseIcon, ExternalIcon, GithubIcon, MenuIcon } from './Icons';

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.search) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.search]);

  return null;
}

export function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  function skipToContent(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const main = document.getElementById('main-content');
    window.setTimeout(() => {
      main?.focus();
      main?.scrollIntoView({ block: 'start' });
    }, 0);
  }

  return (
    <div className="site-frame">
      <ScrollToTop />
      <a className="skip-link" href="#main-content" onClick={skipToContent}>
        Skip to content
      </a>
      <header className="site-header">
        <div className="shell site-header__inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <a className="github-button" href={product.repository} target="_blank" rel="noreferrer">
            <GithubIcon />
            <span>GitHub</span>
          </a>
          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
        {menuOpen ? (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <div className="shell">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <a href={product.repository} target="_blank" rel="noreferrer">
                GitHub <ExternalIcon />
              </a>
            </div>
          </nav>
        ) : null}
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="shell site-footer__inner">
          <div>
            <Brand />
            <p>Official website and public documentation for Papliba.</p>
          </div>
          <div className="footer-links">
            <NavLink to="/docs">Documentation</NavLink>
            <NavLink to="/architecture">Architecture</NavLink>
            <a href={`${product.repository}/blob/main/LICENSE`} target="_blank" rel="noreferrer">
              Website source: Apache 2.0
            </a>
          </div>
          <div className="version-block">
            <span className="status-dot" />
            <span>v{product.version}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

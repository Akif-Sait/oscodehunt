'use client';

import { useState } from 'react';
import PixelIcon from './pixel-icon';
import { eventConfig } from './event-config';
import { RoundSummary } from './round-display';

export default function HuntInterface() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <a className="header-brand" href="#home" aria-label="OSCode REVA home" onClick={() => setMenuOpen(false)}>
          <img src="/art/oscode-cyan.svg" alt="" width="38" height="38" />
          <strong>OSCode</strong><span className="brand-divider" /><span className="reva">REVA</span>
        </a>
        <span className="header-title">Treasure Hunt</span>
        <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          <PixelIcon name={menuOpen ? 'close' : 'menu'} />
        </button>
        <nav id="main-navigation" className={menuOpen ? 'navigation navigation-open' : 'navigation'} aria-label="Main navigation">
          <a className="nav-home" href="#home" aria-current="page" onClick={() => setMenuOpen(false)}>Home</a>
          {eventConfig.navigation.map(({ label, href }) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <a className="pixel-button header-cta" href={eventConfig.entryPath}>Enter the Hunt <PixelIcon name="arrow" /></a>
      </header>

      <section className="hero-copy" aria-labelledby="hunt-title">
        <div className="presenter-shell"><div className="presenter">OSCode REVA Presents</div></div>
        <div className="hero-brand"><img src="/art/oscode-cyan.svg" width="76" height="76" alt="" /><span>OSCode</span></div>
        <h1 id="hunt-title"><img src="/art/treasure-hunt-title.png" alt="Treasure Hunt" /></h1>
        <p className="hero-description">Decode clues. Solve challenges. Explore the campus.<br />{' '}Be the team that uncovers the final treasure.</p>
        <div className="hero-actions">
          <a className="pixel-button" href={eventConfig.entryPath}>Enter the Hunt <PixelIcon name="arrow" /></a>
          <a className="pixel-button button-secondary" href="/rules"><PixelIcon name="book" /> View Rules</a>
        </div>
        <ul className="event-details" aria-label="Event details">
          {[['team', 'Team Event'], ['pin', 'On-site'], ['calendar', eventConfig.dateLabel], ['layers', '3 Rounds']].map(([icon, label]) => (
            <li className="pixel-frame" key={icon}><PixelIcon name={icon} /><span>{label}</span></li>
          ))}
        </ul>
      </section>
      <RoundSummary />
    </>
  );
}

'use client';

import { useRef, useState } from 'react';
import HuntLogin from './login/hunt-login';
import PixelIcon from './pixel-icon';
import { eventConfig } from './event-config';
import { RoundSummary } from './round-display';

export default function HuntInterface({ onHuntVerified }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const loginDialog = useRef(null);

  function openHunt() {
    setMenuOpen(false);
    loginDialog.current.showModal();
  }

  return (
    <>
      <header className="site-header">
        <a className="header-brand" href="#home" aria-label="OSCode REVA home" onClick={() => setMenuOpen(false)}>
          <img src="/art/oscode-cyan.svg" alt="" width="38" height="38" />
          <strong>OSCode</strong><span className="brand-divider" /><span className="reva">REVA</span>
        </a>
        <span className="header-title">{eventConfig.series}</span>
        <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>
          <PixelIcon name={menuOpen ? 'close' : 'menu'} />
        </button>
        <nav id="main-navigation" className={menuOpen ? 'navigation navigation-open' : 'navigation'} aria-label="Main navigation">
          <a className="nav-home" href="#home" aria-current="page" onClick={() => setMenuOpen(false)}>Home</a>
          {eventConfig.navigation.map(({ label, href }) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}
        </nav>
        <button className="pixel-button header-cta" type="button" aria-haspopup="dialog" aria-controls="hunt-login" onClick={openHunt}>Enter the Hunt <PixelIcon name="arrow" /></button>
      </header>

      <section className="hero-copy" aria-labelledby="hunt-title">
        <div className="presenter-shell"><div className="presenter">{eventConfig.host} presents</div></div>
        <div className="hero-brand"><img src="/art/oscode-cyan.svg" width="76" height="76" alt="" /><span>OSCode</span></div>
        <h1 id="hunt-title" aria-label={`${eventConfig.series} – ${eventConfig.title}`}>
          <span className="hunt-title-prefix" aria-hidden="true">{eventConfig.series} · Tech</span>
          <span className="hunt-title-art"><img src="/art/treasure-hunt-title.png" alt="" /></span>
        </h1>
        <p className="hero-description">Solve coding challenges, follow clues across campus, and compete for a spot in the tech quiz finale.</p>
        <div className="hero-actions">
          <button className="pixel-button" type="button" aria-haspopup="dialog" aria-controls="hunt-login" onClick={openHunt}>Enter the Hunt <PixelIcon name="arrow" /></button>
          <a className="pixel-button button-secondary" href={eventConfig.registrationUrl} target="_blank" rel="noopener noreferrer">Register <PixelIcon name="arrow" /></a>
        </div>
        <ul className="event-details" aria-label="Event details">
          {[
            ['calendar', eventConfig.dateLabel],
            ['pin', eventConfig.venue],
            ['team', `${eventConfig.teamSize} per team`],
            ['ticket', eventConfig.feeLabel],
          ].map(([icon, label]) => (
            <li className="pixel-frame" key={icon}><PixelIcon name={icon} /><span>{label}</span></li>
          ))}
        </ul>
        <p className="event-location">{eventConfig.location}</p>
      </section>
      <RoundSummary />
      <HuntLogin dialogRef={loginDialog} onVerified={onHuntVerified} />
    </>
  );
}

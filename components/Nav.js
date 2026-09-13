import Link from 'next/link';

export default function Nav() {
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link className="brand" href="/" aria-label="Cardinal Propulsion Lab home">
          <img src="/cpl-logo.png" alt="Cardinal Propulsion Lab logo" />
          <span>
            <strong>Cardinal Propulsion Lab</strong>
            <small>Stanford University</small>
          </span>
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/">Our Work</Link>
          <Link href="/contact">Contact</Link>
          <Link className="nav-pill" href="/schedule">Member Schedule</Link>
        </nav>
      </div>
    </header>
  );
}

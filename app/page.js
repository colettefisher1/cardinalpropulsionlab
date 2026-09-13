import Link from 'next/link';
import VideoCard from '../components/VideoCard';

const projects = [
  {
    title: 'Hyperion A3 · Static Fire Test 2',
    eyebrow: 'Static fire',
    videoId: '0SWINn8Ib4Q',
    description:
      'A featured static-fire test from the Hyperion A3 development campaign, capturing the hardware, ignition sequence, and test environment in action.',
  },
  {
    title: 'Nitrous / IPA Liquid Biprop',
    eyebrow: 'Liquid bipropellant',
    videoId: 'UA2dw36aSKw',
    description:
      'A liquid bipropellant test using nitrous oxide and isopropyl alcohol, representing the hands-on propulsion work that defines CPL.',
  },
  {
    title: 'Engine Tests',
    eyebrow: 'Test archive',
    videoId: 'QMwNaVfAM0U',
    description:
      'A broader look at engine testing across the team, from test-stand operations to the iterative development process behind reliable propulsion hardware.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">Stanford University · Liquid Rocket Team</span>
          <h1>We build rocket engines, then prove them on the test stand.</h1>
          <p className="hero-lede">
            Cardinal Propulsion Lab is a student-run engineering team focused on the design,
            manufacture, integration, and testing of liquid rocket propulsion systems.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">Explore our work</a>
            <Link className="button button-ghost" href="/contact">Contact CPL</Link>
          </div>
        </div>
        <div className="hero-mark" aria-hidden="true">
          <img src="/cpl-logo.png" alt="" />
        </div>
      </section>

      <section className="stat-band">
        <div className="shell stat-grid">
          <div><strong>DESIGN</strong><span>Propulsion architecture and hardware</span></div>
          <div><strong>BUILD</strong><span>Student-manufactured flight and test hardware</span></div>
          <div><strong>TEST</strong><span>Instrumentation, controls, and static-fire campaigns</span></div>
        </div>
      </section>

      <section id="work" className="section shell">
        <div className="section-heading">
          <span className="eyebrow">Selected test campaigns</span>
          <h2>Previous work</h2>
          <p>
            CPL is built around iteration: design, manufacture, test, learn, and return to the stand
            with better hardware. These videos capture a few of those cycles.
          </p>
        </div>
        <div className="video-grid">
          {projects.map((project) => <VideoCard key={project.videoId} {...project} />)}
        </div>
        <div className="channel-link">
          <a
            href="https://www.youtube.com/@R.T.Finley/videos"
            target="_blank"
            rel="noreferrer"
          >
            View the full R.T. Finley test archive on YouTube ↗
          </a>
        </div>
      </section>

      <section className="section shell mission-grid">
        <div>
          <span className="eyebrow">How we work</span>
          <h2>Engineering is done at the hardware level.</h2>
        </div>
        <div className="mission-copy">
          <p>
            Members learn by taking responsibility for real subsystems and carrying them from analysis
            to manufacturing and test. The result is a team where newer engineers can work directly
            alongside experienced members and quickly become useful contributors.
          </p>
          <p>
            The member schedule on this site helps make that collaboration easier by showing when
            approved CPL members plan to be in the lab.
          </p>
          <Link className="text-link" href="/schedule">Open the member schedule →</Link>
        </div>
      </section>
    </>
  );
}

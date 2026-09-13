import Link from 'next/link';

export const metadata = { title: 'Contact | Cardinal Propulsion Lab' };

export default function ContactPage() {
  return (
    <section className="section shell contact-page">
      <div className="section-heading narrow">
        <span className="eyebrow">Get in touch</span>
        <h1>Contact Cardinal Propulsion Lab</h1>
        <p>
          For team questions, collaboration, recruiting, or general inquiries, contact CPL through the
          information below.
        </p>
      </div>

      <div className="contact-grid">
        <article className="contact-card featured-card">
          <span className="eyebrow">Primary contact</span>
          <h2>Colette Fisher</h2>
          <p>Cardinal Propulsion Lab · Stanford University</p>
          <div className="contact-actions">
            <a className="button button-primary" href="mailto:colettef@stanford.edu">colettef@stanford.edu</a>
            <a
              className="button button-ghost"
              href="https://www.linkedin.com/in/colettefisher"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn ↗
            </a>
          </div>
        </article>

        <article className="contact-card">
          <span className="eyebrow">CPL members</span>
          <h2>Lab schedule</h2>
          <p>
            Approved members can sign in with their Stanford email to see when teammates plan to be
            working. Schedule editing is restricted to CPL administrators.
          </p>
          <Link className="button button-ghost" href="/schedule">Open member schedule</Link>
        </article>
      </div>
    </section>
  );
}

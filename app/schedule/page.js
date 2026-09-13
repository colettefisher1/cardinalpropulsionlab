export const metadata = { title: 'Lab Schedule | Cardinal Propulsion Lab' };

const calendarUrl =
  'https://calendar.google.com/calendar/embed?src=cardinalpropulsionlab%40gmail.com&ctz=America%2FLos_Angeles&mode=WEEK&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=0&showCalendars=0';

export default function SchedulePage() {
  return (
    <section className="section shell schedule-page">
      <div className="section-heading narrow">
        <span className="eyebrow">CPL lab availability</span>
        <h1>Lab schedule</h1>
        <p>
          See when Cardinal Propulsion Lab members plan to be working. The schedule is maintained by
          CPL leadership through our shared Google Calendar.
        </p>
      </div>

      <div
        style={{
          width: '100%',
          minHeight: '760px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '24px',
          background: '#fff',
        }}
      >
        <iframe
          title="Cardinal Propulsion Lab schedule"
          src={calendarUrl}
          style={{ width: '100%', height: '760px', border: 0, display: 'block' }}
          loading="lazy"
        />
      </div>
    </section>
  );
}


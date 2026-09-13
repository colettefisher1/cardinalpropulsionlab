'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

const DAY = 24 * 60 * 60 * 1000;

function mondayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function fmtDay(date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

function fmtTime(value) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export default function SchedulePage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [access, setAccess] = useState(null);
  const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * DAY)),
    [weekStart]
  );

  const loadEntries = useCallback(async (startDate) => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + 7 * DAY);
    const { data, error: queryError } = await supabase
      .from('schedule_entries')
      .select('*')
      .gte('starts_at', start.toISOString())
      .lt('starts_at', end.toISOString())
      .order('starts_at');

    if (queryError) setError(queryError.message);
    else setEntries(data || []);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError('Supabase is not configured yet.');
      return;
    }

    let mounted = true;

    async function initialize() {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session;
      if (!currentSession) {
        router.replace('/login?next=/schedule');
        return;
      }

      const email = currentSession.user.email?.toLowerCase();
      const { data: member, error: memberError } = await supabase
        .from('member_allowlist')
        .select('email, role')
        .eq('email', email)
        .maybeSingle();

      if (!mounted) return;
      setSession(currentSession);
      if (memberError || !member) {
        setAccess(false);
        setLoading(false);
        return;
      }

      setAccess(member);
      await loadEntries(weekStart);
      if (mounted) setLoading(false);
    }

    initialize();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!newSession) router.replace('/login?next=/schedule');
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadEntries, router]);

  useEffect(() => {
    if (access) loadEntries(weekStart);
  }, [weekStart, access, loadEntries]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) return <section className="section shell"><p>Loading schedule…</p></section>;

  if (access === false) {
    return (
      <section className="section shell auth-wrap">
        <div className="auth-card">
          <span className="eyebrow">Access restricted</span>
          <h1>This Stanford account is not on the CPL member list.</h1>
          <p>Ask a CPL administrator to add {session?.user?.email || 'your email'}.</p>
          <button className="button button-ghost" onClick={signOut}>Sign out</button>
        </div>
      </section>
    );
  }

  return (
    <section className="section shell schedule-page">
      <div className="schedule-topbar">
        <div>
          <span className="eyebrow">Members only</span>
          <h1>Lab schedule</h1>
          <p>See when approved CPL members plan to be working.</p>
        </div>
        <div className="schedule-actions">
          {access?.role === 'admin' && <Link className="button button-primary" href="/admin">Admin</Link>}
          <button className="button button-ghost" onClick={signOut}>Sign out</button>
        </div>
      </div>

      <div className="week-controls">
        <button onClick={() => setWeekStart(new Date(weekStart.getTime() - 7 * DAY))}>← Previous</button>
        <strong>{fmtDay(days[0])} – {fmtDay(days[6])}</strong>
        <button onClick={() => setWeekStart(new Date(weekStart.getTime() + 7 * DAY))}>Next →</button>
      </div>

      {error && <p className="form-message">{error}</p>}

      <div className="calendar-grid">
        {days.map((day) => {
          const sameDay = entries.filter((entry) => {
            const d = new Date(entry.starts_at);
            return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
          });
          return (
            <article className="calendar-day" key={day.toISOString()}>
              <header>{fmtDay(day)}</header>
              <div className="calendar-items">
                {sameDay.length === 0 ? <span className="empty-day">No entries</span> : sameDay.map((entry) => (
                  <div className="schedule-entry" key={entry.id}>
                    <strong>{entry.display_name}</strong>
                    <span>{fmtTime(entry.starts_at)} – {fmtTime(entry.ends_at)}</span>
                    <p>{entry.activity}</p>
                    {entry.notes && <small>{entry.notes}</small>}
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

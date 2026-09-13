'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

function localInputValue(date = new Date()) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 16);
}

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(null);
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    display_name: '',
    starts_at: localInputValue(new Date(Date.now() + 60 * 60 * 1000)),
    ends_at: localInputValue(new Date(Date.now() + 3 * 60 * 60 * 1000)),
    activity: '',
    notes: '',
    repeat_weeks: 0,
  });
  const [member, setMember] = useState({ email: '', role: 'member' });

  async function loadEntries() {
    const { data, error } = await supabase
      .from('schedule_entries')
      .select('*')
      .gte('ends_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('starts_at')
      .limit(100);
    if (error) setMessage(error.message);
    else setEntries(data || []);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthorized(false);
      setMessage('Supabase is not configured yet.');
      return;
    }

    async function initialize() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session) {
        router.replace('/login?next=/admin');
        return;
      }
      const email = session.user.email?.toLowerCase();
      const { data: row } = await supabase
        .from('member_allowlist')
        .select('role')
        .eq('email', email)
        .maybeSingle();
      if (!row || row.role !== 'admin') {
        setAuthorized(false);
        return;
      }
      setAuthorized(true);
      setForm((old) => ({ ...old, display_name: session.user.user_metadata?.full_name || '' }));
      loadEntries();
    }
    initialize();
  }, [router]);

  async function addEntry(event) {
    event.preventDefault();
    setMessage('');

    const baseStart = new Date(form.starts_at);
    const baseEnd = new Date(form.ends_at);
    if (!(baseEnd > baseStart)) {
      setMessage('End time must be after the start time.');
      return;
    }

    const count = Number(form.repeat_weeks || 0);
    const rows = Array.from({ length: count + 1 }, (_, index) => ({
      display_name: form.display_name.trim(),
      starts_at: new Date(baseStart.getTime() + index * 7 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(baseEnd.getTime() + index * 7 * 24 * 60 * 60 * 1000).toISOString(),
      activity: form.activity.trim(),
      notes: form.notes.trim() || null,
    }));

    const { error } = await supabase.from('schedule_entries').insert(rows);
    if (error) setMessage(error.message);
    else {
      setMessage(rows.length === 1 ? 'Schedule entry added.' : `${rows.length} weekly entries added.`);
      setForm((old) => ({ ...old, activity: '', notes: '', repeat_weeks: 0 }));
      loadEntries();
    }
  }

  async function removeEntry(id) {
    if (!window.confirm('Delete this schedule entry?')) return;
    const { error } = await supabase.from('schedule_entries').delete().eq('id', id);
    if (error) setMessage(error.message);
    else loadEntries();
  }

  async function addMember(event) {
    event.preventDefault();
    const email = member.email.trim().toLowerCase();
    if (!email.endsWith('@stanford.edu')) {
      setMessage('Member access is limited to Stanford email addresses.');
      return;
    }
    const { error } = await supabase
      .from('member_allowlist')
      .upsert({ email, role: member.role }, { onConflict: 'email' });
    if (error) setMessage(error.message);
    else {
      setMessage(`${email} now has ${member.role} access.`);
      setMember({ email: '', role: 'member' });
    }
  }

  if (authorized === null) return <section className="section shell"><p>Checking admin access…</p></section>;
  if (authorized === false) {
    return (
      <section className="section shell auth-wrap">
        <div className="auth-card">
          <span className="eyebrow">Admin only</span>
          <h1>You do not have administrator access.</h1>
          {message && <p className="form-message">{message}</p>}
          <Link className="button button-ghost" href="/schedule">Back to schedule</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section shell admin-page">
      <div className="schedule-topbar">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Manage CPL schedule</h1>
          <p>Add lab hours and control member access.</p>
        </div>
        <Link className="button button-ghost" href="/schedule">View schedule</Link>
      </div>

      {message && <p className="form-message">{message}</p>}

      <div className="admin-grid">
        <form className="panel form-panel" onSubmit={addEntry}>
          <span className="eyebrow">Schedule</span>
          <h2>Add lab hours</h2>
          <label>Name<input required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></label>
          <div className="form-two">
            <label>Start<input type="datetime-local" required value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></label>
            <label>End<input type="datetime-local" required value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></label>
          </div>
          <label>Activity<input required placeholder="Injector machining, engine assembly…" value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} /></label>
          <label>Notes<textarea rows="3" placeholder="Optional details" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
          <label>Repeat weekly
            <select value={form.repeat_weeks} onChange={(e) => setForm({ ...form, repeat_weeks: e.target.value })}>
              <option value="0">No repeat</option>
              <option value="1">For 2 weeks</option>
              <option value="3">For 4 weeks</option>
              <option value="7">For 8 weeks</option>
              <option value="11">For 12 weeks</option>
            </select>
          </label>
          <button className="button button-primary" type="submit">Add to schedule</button>
        </form>

        <form className="panel form-panel" onSubmit={addMember}>
          <span className="eyebrow">Access</span>
          <h2>Add or update member</h2>
          <label>Stanford email<input type="email" required placeholder="name@stanford.edu" value={member.email} onChange={(e) => setMember({ ...member, email: e.target.value })} /></label>
          <label>Role
            <select value={member.role} onChange={(e) => setMember({ ...member, role: e.target.value })}>
              <option value="member">Member · view schedule</option>
              <option value="admin">Admin · view and edit</option>
            </select>
          </label>
          <button className="button button-primary" type="submit">Save access</button>
          <p className="helper-text">Only allowlisted Stanford accounts can view the schedule.</p>
        </form>
      </div>

      <div className="panel entries-panel">
        <div className="panel-title"><span className="eyebrow">Upcoming</span><h2>Schedule entries</h2></div>
        {entries.length === 0 ? <p>No upcoming entries.</p> : (
          <div className="admin-entry-list">
            {entries.map((entry) => (
              <div className="admin-entry" key={entry.id}>
                <div>
                  <strong>{entry.display_name} · {entry.activity}</strong>
                  <span>{new Date(entry.starts_at).toLocaleString()} → {new Date(entry.ends_at).toLocaleString()}</span>
                </div>
                <button className="danger-button" onClick={() => removeEntry(entry.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

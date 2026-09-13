'use client';

import { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();

    if (!normalized.endsWith('@stanford.edu')) {
      setMessage('Use your Stanford email address.');
      return;
    }

    if (!isSupabaseConfigured) {
      setMessage('Authentication is not configured yet. Add the Supabase environment variables first.');
      return;
    }

    setBusy(true);
    setMessage('');
    const requestedNext = new URLSearchParams(window.location.search).get('next') || '/schedule';
    const safeNext = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/schedule';
    const redirect = `${window.location.origin}${safeNext}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { emailRedirectTo: redirect },
    });
    setBusy(false);

    if (error) setMessage(error.message);
    else setMessage('Check your Stanford inbox for the secure sign-in link.');
  }

  return (
    <section className="section shell auth-wrap">
      <div className="auth-card">
        <span className="eyebrow">Members only</span>
        <h1>Sign in to CPL</h1>
        <p>Use an approved Stanford email. No password is required.</p>
        <form onSubmit={submit}>
          <label>
            Stanford email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@stanford.edu"
              autoComplete="email"
              required
            />
          </label>
          <button className="button button-primary" disabled={busy} type="submit">
            {busy ? 'Sending…' : 'Email me a sign-in link'}
          </button>
        </form>
        {message && <p className="form-message">{message}</p>}
      </div>
    </section>
  );
}

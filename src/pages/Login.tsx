"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg2)] p-4">
      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-2xl shadow-lg border border-[var(--border)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--heading)]">Welcome back</h1>
          <p className="text-[var(--text-muted)]">Sign in to manage your projects</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#6366f1',
                  brandAccent: '#4f46e5',
                },
              },
            },
          }}
          theme="light"
          providers={[]}
        />
      </div>
    </div>
  );
};

export default Login;
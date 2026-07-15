import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../components/AuthProvider";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { session } = useAuth();

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg)] px-4 pb-10 sm:px-6 ">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_65%)]" />
      <div className="pointer-events-none absolute left-1/2 top-36 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative p-5! mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface-glass)] shadow-[var(--shadow-xl-soft)] backdrop-blur-xl lg:grid-cols-[1.05fr_1fr]">
        <section className="relative flex flex-col justify-between border-b p-8 sm:p-10 lg:border-b-0 ">
          <div>
            <span className="inline-flex p-2! rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-indigo-400">
              Nexus Workspace
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-[-0.04em] text-[var(--heading)] sm:text-5xl">
              Welcome back
            </h1>
            <p className="mt-4 max-w-md text-base text-[var(--text-muted)]">
              Sign in to resume your projects, track progress, and keep your
              team flow focused.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            <div className="rounded-2xl p-2! border border-[var(--border)] bg-[var(--surface-glass-strong)] px-4 py-3">
              Secure login
            </div>
            <div className="rounded-2xl p-2! border mr-1! border-[var(--border)] bg-[var(--surface-glass-strong)] px-4 py-3">
              Project sync
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-black tracking-[-0.03em] text-[var(--heading)]">
              Sign in
            </h2>
            <p className="my-2! text-sm text-[var(--text-muted)]">
              Use your account credentials to enter your workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4! sm:p-5!">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                className: {
                  input: "auth-input",
                },
                variables: {
                  default: {
                    colors: {
                      brand: "#6366f1",
                      brandAccent: "#4f46e5",
                    },
                  },
                },
                style: {
                  input: {
                    color: "var(--heading)",
                    background: "var(--surface-strong)",
                    borderColor: "var(--border)",
                  },
                },
              }}
              theme="light"
              providers={[]}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;

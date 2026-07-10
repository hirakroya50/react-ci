import { useState, useEffect } from "react";
import "./App.css";

const features = [
  {
    icon: "⚡",
    title: "Lightning Fast",
    desc: "Optimized  with instant load times and smooth animations out of the box.",
  },
  {
    icon: "🎨",
    title: "Beautiful Design",
    desc: "Pixel-perfect  components with a cohesive design language built for modern products.",
  },
  {
    icon: "🔒",
    title: "Secure by Default",
    desc: "Enterprise-grade security baked in from day one. Your data is always protected.",
  },
  {
    icon: "📱",
    title: "Fully Responsive",
    desc: "Seamless experience across every device — desktop, tablet, and mobile.",
  },
  {
    icon: "🔌",
    title: "Easy Integration",
    desc: "Connect to any third-party service with our plug-and-play integration system.",
  },
  {
    icon: "📊",
    title: "Real-time Analytics",
    desc: "Monitor your metrics live with powerful dashboards and actionable insights.",
  },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "200ms", label: "Avg. Response" },
  { value: "50k+", label: "Happy Users" },
  { value: "4.9★", label: "User Rating" },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO at NovaTech",
    avatar: "SC",
    text: "Switching to this platform cut our deployment time by 60%. The DX is genuinely exceptional.",
  },
  {
    name: "Marcus Rivera",
    role: "Lead Engineer at Flux",
    avatar: "MR",
    text: "The best developer experience I have had in years. Clean APIs and zero config headaches.",
  },
  {
    name: "Aisha Patel",
    role: "Product Manager at Orbit",
    avatar: "AP",
    text: "Our team was up and running in under an hour. The onboarding is ridiculously smooth.",
  },
];

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (
      stored === "dark" ||
      (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="app">
      {/* Navbar */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <span className="logo-icon">◈</span>
            <span>Nexus</span>
          </a>
          <ul className={`nav-links${menuOpen ? " open" : ""}`}>
            {["Features", "Pricing", "Docs", "Blog"].map((item) => (
              <li key={item}>
                <a href="#" onClick={() => setMenuOpen(false)}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <button
              className="theme-toggle"
              onClick={() => setDarkMode((d) => !d)}
              aria-label="Toggle theme"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            <a href="#" className="btn btn-ghost">
              Sign in
            </a>
            <a href="#" className="btn btn-primary">
              Get Started
            </a>
            <button
              className="menu-btn"
              onClick={() => setMenuOpen((m) => !m)}
              aria-label="Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">🚀 Now in beta</div>
          <h1 className="hero-title">
            Build products
            <br />
            <span className="gradient-text">10× faster</span>
          </h1>
          <p className="hero-sub">
            The modern platform for teams who ship. Streamline your workflow,
            collaborate in real-time, and deploy with confidence.
          </p>
          <div className="hero-cta">
            <a href="#" className="btn btn-primary btn-lg">
              Start for free →
            </a>
            <a href="#" className="btn btn-outline btn-lg">
              Watch demo
            </a>
          </div>
          <p className="hero-note">
            No credit card required · 14-day free trial
          </p>
        </div>

        {/* Mock UI card */}
        <div className="hero-visual">
          <div className="mock-card">
            <div className="mock-header">
              <div className="mock-dots">
                <span style={{ background: "#ff5f57" }} />
                <span style={{ background: "#febc2e" }} />
                <span style={{ background: "#28c840" }} />
              </div>
              <span className="mock-title">Dashboard</span>
            </div>
            <div className="mock-body">
              <div className="mock-stat">
                <span className="mock-stat-val">$48,295</span>
                <span className="mock-stat-lbl">Revenue ↑ 12%</span>
              </div>
              <div className="mock-bar-group">
                {[65, 80, 45, 90, 60, 75, 85].map((h, i) => (
                  <div
                    key={i}
                    className="mock-bar"
                    style={{ "--h": `${h}%` } as React.CSSProperties}
                  />
                ))}
              </div>
              <div className="mock-tags">
                <span className="tag tag-green">Active</span>
                <span className="tag tag-blue">7 users online</span>
                <span className="tag tag-purple">3 deploys today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-label">Features</span>
          <h2 className="section-title">Everything you need to ship</h2>
          <p className="section-sub">
            A complete toolkit for modern development teams, crafted with care.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <span className="section-label">Testimonials</span>
          <h2 className="section-title">Loved by developers</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((t) => (
            <div key={t.name} className="testimonial-card">
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="avatar">{t.avatar}</div>
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to get started?</h2>
          <p>Join 50,000+ teams already building with Nexus.</p>
          <a href="#" className="btn btn-white btn-lg">
            Create free account →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <a href="#" className="nav-logo">
            <span className="logo-icon">◈</span>
            <span>Nexus</span>
          </a>
          <div className="footer-links">
            {["Privacy", "Terms", "Docs", "Status", "GitHub"].map((l) => (
              <a key={l} href="#">
                {l}
              </a>
            ))}
          </div>
          <p className="footer-copy">© 2026 Nexus, Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle.jsx";

function Container({ children }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

function NavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900
                 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700
                     dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      {children}
    </span>
  );
}

function FeatureCard({ title, desc, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm
                    dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700
                        dark:bg-blue-500/15 dark:text-blue-300">
          <span className="text-lg">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({ index, title, desc, status }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm
                    dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white text-sm font-bold
                        dark:bg-slate-100 dark:text-slate-900">
          {index}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </p>
            {status && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700
                               dark:bg-slate-800 dark:text-slate-200">
                {status}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  // close mobile menu on route change feeling (basic)
  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* ---------------- Navbar ---------------- */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur
                         dark:border-slate-800 dark:bg-slate-950/70">
        <Container>
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                FA
              </div>
              <div className="leading-4">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Field Appointment
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Admin + Technician Workflow
                </p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink to="/#features">Features</NavLink>
              <NavLink to="/#how">How it works</NavLink>
              <NavLink to="/#security">Security</NavLink>
              <NavLink to="/#footer">Contact</NavLink>
            </nav>

            {/* Actions */}
            <div className="hidden items-center gap-2 md:flex">
              <ThemeToggle />

              <button
                onClick={() => navigate("/login")}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800
                           dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Admin Login
              </button>

              <button
                onClick={() => navigate("/tech-login")}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50
                           dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                Technician Login
              </button>
            </div>

            {/* Mobile button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <button
                onClick={() => setMobileOpen((s) => !s)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50
                           dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                {mobileOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden pb-4">
              <div className="mt-2 space-y-1 rounded-xl border border-slate-200 bg-white p-2
                              dark:border-slate-800 dark:bg-slate-950">
                <NavLink to="/#features" onClick={() => setMobileOpen(false)}>
                  Features
                </NavLink>
                <NavLink to="/#how" onClick={() => setMobileOpen(false)}>
                  How it works
                </NavLink>
                <NavLink to="/#security" onClick={() => setMobileOpen(false)}>
                  Security
                </NavLink>
                <NavLink to="/#footer" onClick={() => setMobileOpen(false)}>
                  Contact
                </NavLink>

                <div className="mt-2 grid grid-cols-1 gap-2 px-2 pb-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800
                               dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  >
                    Admin Login
                  </button>

                  <button
                    onClick={() => navigate("/tech-login")}
                    className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50
                               dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                  >
                    Technician Login
                  </button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-white to-white
                        dark:from-blue-950/40 dark:via-slate-950 dark:to-slate-950" />

        <Container>
          <div className="py-14 sm:py-20">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              {/* Text */}
              <div className="max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>Auto Technician Assignment</Pill>
                  <Pill>OTP-secured workflow</Pill>
                  <Pill>Reminder Cron System</Pill>
                </div>

                <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                  Field Appointment System
                  <span className="block text-blue-600 dark:text-blue-400">
                    Diagnosis → Repair → Payment Automation
                  </span>
                </h1>

                <p className="mt-4 text-base text-slate-600 sm:text-lg dark:text-slate-300">
                  A complete appointment workflow platform for service businesses:
                  admin schedules diagnosis, system auto-assigns technicians based on
                  category + daily capacity, technician verifies OTP to start tasks,
                  customer approvals convert diagnosis into repair, and reminders are
                  sent automatically.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("/login")}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Launch Admin Panel
                  </button>

                  <button
                    onClick={() => navigate("/tech-login")}
                    className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50
                               dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
                  >
                    Technician Portal
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Built with role-based auth, OTP checkpoints & audit logs.
                </p>
              </div>

              {/* Visual */}
              <div className="w-full max-w-xl">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm
                                dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    REAL WORKFLOW (FROM BACKEND)
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4
                                    dark:border-slate-800 dark:bg-slate-900/40">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        1) Admin schedules Diagnosis
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Creates appointment → auto-assign technician if available.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Pill>diagnosis_scheduled</Pill>
                        <Pill>waiting_for_assignment</Pill>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4
                                    dark:border-slate-800 dark:bg-slate-900/40">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        2) Technician verifies OTP
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        OTP required to start diagnosis / repair / payment.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Pill>diagnosis_in_progress</Pill>
                        <Pill>repair_in_progress</Pill>
                        <Pill>repair_completed</Pill>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4
                                    dark:border-slate-800 dark:bg-slate-900/40">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        3) Admin approves Repair
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Diagnosis converts into repair appointment with schedule.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Pill>diagnosis_completed_waiting_approval</Pill>
                        <Pill>repair_scheduled</Pill>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-4
                                    dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Reminders
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                        Cron every minute
                      </p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        technician_reminder / customer_reminder
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-4
                                    dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Alerts
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                        notifyAdmin()
                      </p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        OTP abuse / Reminder failures
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* end visual */}
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- Features ---------------- */}
      <section id="features" className="py-14 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Why this platform is powerful
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Everything here is based on your actual backend: cron reminders,
              OTP checkpoints, auto technician assignment, cancellation workflow,
              and audit logs.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="🧠"
              title="Smart Technician Auto-Assign"
              desc="Auto selects technician by category + remaining daily capacity (work hours - workload). If no match → waiting_for_assignment + admin email alert."
            />
            <FeatureCard
              icon="🔐"
              title="OTP-secured diagnosis/repair/payment"
              desc="Technician must verify OTP to start diagnosis, start repair, and confirm payment completion. Prevents fake completion."
            />
            <FeatureCard
              icon="⏱️"
              title="Automated reminders (Cron)"
              desc="Every minute cron checks reminders table → sends emails to technician/customer. Retries up to 5 times with notifyAdmin on failures."
            />
            <FeatureCard
              icon="📋"
              title="Admin dashboard + appointment control"
              desc="Admin can view diagnosis/repair/completed filters, paginate, search by phone, open detail modal, and cancel active appointments."
            />
            <FeatureCard
              icon="👥"
              title="Customer CRM + duplicate prevention"
              desc="Customer records stored per admin. Adding customer checks phone number first to prevent duplicates."
            />
            <FeatureCard
              icon="🧾"
              title="Logs + accountability"
              desc="Every major event writes logs (OTP sent/verified, diagnosis complete, repair created, cancellation). Fully auditable workflow."
            />
          </div>
        </Container>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section id="how" className="py-14 sm:py-20 border-t border-slate-200 dark:border-slate-800">
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              How it works (real backend flow)
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              These steps align directly with your controller logic and status pipeline.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Step
              index="1"
              title="Admin schedules diagnosis"
              status="POST /api/appointments/diagnosis"
              desc="Creates or reuses customer record. Auto-assign technician if category matches and capacity fits, else triggers notifyAdmin and keeps it unassigned."
            />
            <Step
              index="2"
              title="Auto assignment or manual fallback"
              status="waiting_for_assignment → assign-technician"
              desc="If no technician fits workload/capacity, appointment remains waiting_for_assignment. Admin assigns technician manually from dashboard."
            />
            <Step
              index="3"
              title="Technician OTP to start diagnosis"
              status="diagnosis_scheduled → diagnosis_in_progress"
              desc="OTP is emailed to customer. Technician requests + verifies OTP to start the job. OTP abuse detection notifies admin."
            />
            <Step
              index="4"
              title="Technician completes diagnosis (Quote)"
              status="diagnosis_in_progress → diagnosis_completed_waiting_approval"
              desc="Technician submits issue description, duration, estimated cost, parts requirement, and suggested repair schedule. Quote is emailed to customer."
            />
            <Step
              index="5"
              title="Admin approves repair"
              status="POST /api/appointments/:id/repair-approval"
              desc="Diagnosis appointment converts into a repair appointment. Technician is retained if capacity allows, else unassigned with admin notification."
            />
            <Step
              index="6"
              title="Repair starts + payment OTP"
              status="repair_scheduled → repair_in_progress → repair_completed"
              desc="Repair requires OTP to start. Payment requires OTP verification from customer to mark repair completed."
            />
          </div>
        </Container>
      </section>

      {/* ---------------- Security ---------------- */}
      <section id="security" className="py-14 sm:py-20 border-t border-slate-200 dark:border-slate-800">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Security + Reliability built-in
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Your system isn't just appointments — it’s a secured workflow engine.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Anti-abuse OTP system
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Max 3 OTP requests in 5 mins → notifyAdmin triggers. OTP expires automatically.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Reminder delivery retry system
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Cron retries up to 5 attempts. After that admin is emailed with action required.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Password reset via OTP
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Admin + technician can reset password using secure OTP verification and short-lived JWT reset token.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA box */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-blue-50 to-white p-6 shadow-sm
                            dark:border-slate-800 dark:from-blue-950/40 dark:to-slate-950">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Start using the workflow
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Use admin panel to schedule diagnosis and manage technicians. Use technician portal to complete OTP-secured tasks.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Admin Login
                </Link>

                <Link
                  to="/tech-login"
                  className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50
                             dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
                >
                  Technician Login
                </Link>
              </div>

              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Everything uses real-time statuses + audit logs.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer
        id="footer"
        className="border-t border-slate-200 py-10 dark:border-slate-800"
      >
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Field Appointment System
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Appointment automation for service businesses — diagnosis → repair → payment.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Pill>OTP Workflows</Pill>
              <Pill>Auto Assign</Pill>
              <Pill>Reminder Cron</Pill>
              <Pill>Audit Logs</Pill>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} Field Appointment Platform. All rights reserved.</p>
            <p className="text-xs">
              Built by Ace • Full-stack workflow system
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

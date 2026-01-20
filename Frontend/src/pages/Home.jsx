import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

/* ---------------- Layout helpers ---------------- */
function Container({ children }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}

function FeatureCard({ title, desc, icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
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

function Step({ index, title, desc }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-900">
          {index}
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

/* ---------------- Page ---------------- */
export default function Home() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar variant="full" />

      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-white to-white dark:from-blue-950/40 dark:via-slate-950 dark:to-slate-950" />

        <Container>
          <div className="pt-20 sm:py-20">
            <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
              {/* Copy */}
              <div className="max-w-2xl">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                  Run field service operations
                  <span className="mt-2 block text-blue-600 dark:text-blue-400">
                    faster, safer, and more organized
                  </span>
                </h1>

                <p className="mt-4 text-base text-slate-600 sm:text-lg dark:text-slate-300">
                  Field Appointment System helps service businesses manage
                  diagnosis and repair visits end-to-end — from scheduling to
                  technician assignment, customer confirmation, reminders, and
                  payment completion.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigate("/signup")}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Open Admin Panel
                  </button>

                  <button
                    onClick={() => navigate("/tech-login")}
                    className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
                  >
                    Technician Portal
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Designed for real businesses: reduce missed appointments,
                  increase trust, and scale operations.
                </p>
              </div>

              {/* Visual */}
              <div className="w-full max-w-xl">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    BUSINESS WORKFLOW OVERVIEW
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Appointment scheduling
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Admin creates a diagnosis visit, and the system
                        immediately tries to allocate the best technician.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Customer verified service
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Service starts only after customer confirmation using
                        OTP — boosting trust and preventing disputes.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Quote approval → repair workflow
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        After diagnosis, admin approves repair, schedules it,
                        and reminders are automatically sent to both sides.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Reminder automation
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                        Zero missed visits
                      </p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        Automatic email reminders to technician + customer.
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Operational alerts
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                        Admin stays informed
                      </p>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        Alerts for assignment issues & failures.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* End visual */}
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- Features ---------------- */}
      <section
        id="features"
        className="py-14 sm:py-20 mt-10 border-t border-slate-300 dark:lg:border-slate-800"
      >
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Built for service businesses
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Everything is designed to simplify scheduling, improve technician
              productivity, and create strong customer trust — without manual
              follow-ups.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="🧠"
              title="Smart technician allocation"
              desc="Appointments are assigned based on technician expertise category and daily available capacity — reducing overload and delays."
            />
            <FeatureCard
              icon="🔐"
              title="Customer confirmed service"
              desc="OTP confirmation is required at important stages, making the service process transparent and dispute-free."
            />
            <FeatureCard
              icon="⏱️"
              title="Automated reminders"
              desc="Technicians and customers receive email reminders automatically — improving attendance and reducing cancellations."
            />
            <FeatureCard
              icon="📋"
              title="Admin control center"
              desc="Manage customers, technicians, appointments, approvals, and cancellations from one panel."
            />
            <FeatureCard
              icon="👥"
              title="Customer management"
              desc="Maintain customer records with search, contact details, and address — no duplicates, no confusion."
            />
            <FeatureCard
              icon="🧾"
              title="Clear accountability"
              desc="Every major activity is tracked so admins can review what happened at any time."
            />
          </div>
        </Container>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section
        id="how"
        className="border-t border-slate-300 py-14 dark:border-slate-800 sm:py-20"
      >
        <Container>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              How it works
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              A simple step-by-step flow — built for real-life service
              operations.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Step
              index="1"
              title="Schedule a diagnosis visit"
              desc="Admin schedules the visit and the system tries to allocate the most suitable technician instantly."
            />
            <Step
              index="2"
              title="Technician assignment (automatic or manual)"
              desc="If someone is available, assignment happens automatically. Otherwise, admin can assign manually."
            />
            <Step
              index="3"
              title="Technician starts service with customer confirmation"
              desc="Technician verifies OTP with the customer before starting, ensuring trust and transparency."
            />
            <Step
              index="4"
              title="Diagnosis completed and quote shared"
              desc="Technician submits findings, estimated duration, cost, and recommended repair schedule."
            />
            <Step
              index="5"
              title="Repair approval"
              desc="Admin approves the quote and converts the workflow into a repair appointment."
            />
            <Step
              index="6"
              title="Repair completion and payment confirmation"
              desc="Repair is completed with secure payment confirmation, and the appointment is marked closed."
            />
          </div>
        </Container>
      </section>

      {/* ---------------- Security ---------------- */}
      <section
        id="security"
        className="border-t border-slate-200 py-14 dark:border-slate-800 sm:py-20"
      >
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Trust, security & reliability
              </h2>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                This platform protects both business owners and customers
                through secure verification and strong operational reliability.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    OTP-based verification
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    OTP ensures that diagnosis, repair start, and payments are
                    confirmed by the customer.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Reminder reliability
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Reminders are retried automatically to avoid missed
                    communications.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Secure password recovery
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Password resets happen only through OTP verification so
                    accounts stay protected.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-blue-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-blue-950/40 dark:to-slate-950">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Get started
              </h3>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Admins manage operations. Technicians complete service tasks
                securely. Customers stay informed.
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
                  className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-900"
                >
                  Technician Login
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer
        id="footer"
        className="border-t border-slate-200 dark:border-slate-800"
      >
        <Container>
          <div className="py-7">
            <h3 className="mb-10 text-lg font-semibold text-blue-500">
              Field Appointment Scheduler & Auto-Reminder Platform
            </h3>

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {/* Quick Links */}
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Quick Links
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <a
                    href="#features"
                    className="block text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                  >
                    Features
                  </a>
                  <a
                    href="#how"
                    className="block text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                  >
                    How it works
                  </a>
                  <a
                    href="#security"
                    className="block text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                  >
                    Security
                  </a>
                </div>
              </div>

              {/* Support */}
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Support
                </p>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-slate-600 dark:text-slate-300">
                    Help Center (coming soon)
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">
                    Terms & Privacy (coming soon)
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Contact
                </p>

                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <span>📧</span>
                    <a
                      href="mailto:fieldappointment.support@gmail.com"
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      deepakm.code@gmail.com
                    </a>
                  </p>

                  <p className="flex items-center gap-2">
                    <span>📞</span>
                    <a
                      href="tel:+919999999999"
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      +91 63638 *****
                    </a>
                  </p>

                  <p className="flex items-center gap-2">
                    <span>📍</span>
                    <span>India • On-site Field Services</span>
                  </p>

                  {/* Social Links */}
                  <div className="flex items-center gap-3 pt-2">
                    <a
                      href="https://www.linkedin.com/in/deepakm-fullstack-dev/"
                      className="flex rounded-md border border-slate-200 bg-white px-1.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50
                                 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                      <img
                        src="https://api.iconify.design/mdi/linkedin.svg"
                        alt="LinkedIn"
                        className="mx-auto mr-1 h-4 w-4 dark:invert"
                      />
                      LinkedIn
                    </a>

                    <a
                      href="https://github.com/deepakM-8bit"
                      className="flex rounded-md border border-slate-200 bg-white px-1.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50
                                 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                    >
                      <img
                        src="https://api.iconify.design/mdi/github.svg"
                        alt="GitHub"
                        className="mx-auto mr-1 h-4 w-4 dark:invert"
                      />
                      Github
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p>© {year} Field Appointment Platform. All rights reserved.</p>
              <p className="text-xs">
                Built by Deepak • Real-world service automation
              </p>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}

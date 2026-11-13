
import {
  Activity,
  Bell,
  ChartNoAxesCombined,
  LayoutDashboard,
  Radio,
  ShieldAlert,
  Waves,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'

const navigation = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    label: 'Live Monitoring',
    icon: Activity,
    path: '/monitoring',
  },
  {
    label: 'Risk Intelligence',
    icon: ShieldAlert,
    path: '/risk',
  },
  {
    label: 'Alerts',
    icon: Bell,
    path: '/alerts',
  },
  {
    label: 'Analytics',
    icon: ChartNoAxesCombined,
    path: '/analytics',
  },
  {
    label: 'Sensor Network',
    icon: Radio,
    path: '/sensors',
  },
]

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#101010] text-[#F5F5F5]">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-white/10 bg-[#181818] lg:block">

        {/* Logo */}
        <div className="flex h-20 items-center border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-400/10">
              <Waves className="h-5 w-5 text-orange-400" />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Hydro<span className="text-orange-400">Sentry</span>
              </h1>

              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500">
                Flood Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Command Center
          </p>

          <div className="space-y-1">
            {navigation.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                to={item.path}
              >
                {item.label}
              </NavItem>
            ))}
          </div>
        </nav>

        {/* System status */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-400" />
              </span>

              <div>
                <p className="text-xs font-medium text-slate-200">
                  System Online
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  All services operational
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="min-h-screen bg-[#101010] lg:ml-64">

        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#181818]/95 px-5 backdrop-blur-xl sm:px-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-xs">
              Regional Operations
            </p>

            <h2 className="mt-1 text-sm font-semibold sm:text-lg">
              Flash Flood Command Center
            </h2>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">

            {/* Live status */}
            <div className="hidden items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-3 py-1.5 sm:flex">
              <span className="h-2 w-2 rounded-full bg-orange-400" />

              <span className="text-xs font-medium text-orange-400">
                LIVE
              </span>
            </div>

            {/* Alert button */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.06] hover:text-white">
              <Bell className="h-4 w-4" />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-400" />
            </button>

            {/* User */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-semibold text-slate-300">
              HS
            </div>
          </div>
        </header>

        {/* Page */}
        <section className="min-h-screen bg-[#101010] p-5 sm:p-8">
          {children}
        </section>
      </main>
    </div>
  )
}

function NavItem({ children, icon: Icon, to }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
          isActive
            ? 'bg-orange-400/10 text-orange-400'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`h-4 w-4 ${
              isActive
                ? 'text-orange-400'
                : 'text-slate-500 group-hover:text-slate-300'
            }`}
          />

          <span>{children}</span>
        </>
      )}
    </NavLink>
  )
}

export default DashboardLayout

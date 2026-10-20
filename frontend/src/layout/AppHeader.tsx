import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { ThemeToggleButton } from "../components/common/ThemeToggleButton"; 
import UserDropdown from "../components/header/UserDropdown";
import AnnouncementBadgeTicker from "../components/header/AnnouncementBadgeTicker";
import { useAuth } from "../hooks/useAuth";
import { ERole } from "../services/authService";
import { useSchoolBalance } from "../hooks/useSchoolBalance";
import { useActiveAnnouncements } from "../hooks/useActiveAnnouncements";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "RWF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const ROLE_BADGE: Record<ERole, { label: string; classes: string }> = {
  [ERole.HEADERTEACHER]:        { label: "Head Teacher Portal",   classes: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800" },
  [ERole.CLASSTEACHER]:         { label: "Class Teacher Portal",  classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800" },
  [ERole.TEACHER]:              { label: "Teacher Portal",        classes: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800" },
  [ERole.PARENT]:               { label: "Parent Portal",         classes: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800" },
  [ERole.SCHOOL_BOARD_MANAGER]: { label: "Board Manager Portal",  classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800" },
  [ERole.ACCOUNTANT]:           { label: "Accountant Portal",     classes: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800" },
};

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { user } = useAuth();
  const roleBadge = user?.role ? (ROLE_BADGE[user.role as ERole] || { label: String(user.role), classes: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700" }) : null;
  const isHeaderTeacher = user?.role === ERole.HEADERTEACHER;
  const isAccountant = user?.role === ERole.ACCOUNTANT;
  const isBoardSchool = user?.role === ERole.SCHOOL_BOARD_MANAGER;
  const showBalance = isHeaderTeacher || isAccountant || isBoardSchool;

  const { balance, loading: balanceLoading, error: balanceError } = useSchoolBalance();
  const { activeAnnouncements } = useActiveAnnouncements();

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen((prev) => !prev);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 flex flex-col w-full bg-white border-b border-gray-200 z-40 dark:border-gray-800 dark:bg-gray-900 transition-colors">
      {/* Primary Top Bar Row */}
      <div className="flex items-center justify-between w-full px-3 py-2 sm:px-4 lg:px-6 lg:py-3.5">
        {/* Left Side: Sidebar Toggle + Logo (mobile) + Desktop Search */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 lg:h-11 lg:w-11 transition-colors shrink-0"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="18" height="14" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z"
                  fill="currentColor"
                />
              </svg>
            )}
          </button>

          {/* Logo on Mobile */}
          <Link to="/" className="lg:hidden shrink-0 flex items-center">
            <img
              className="dark:hidden h-7 w-auto object-contain"
              src="/images/logo/logo.png"
              alt="Logo"
            />
            <img
              className="hidden dark:block h-7 w-auto object-contain"
              src="/images/logo/logo.png"
              alt="Logo"
            />
          </Link>

          {/* Search Bar on Desktop */}
          <div className="hidden lg:block">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <span className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 fill-current"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                    />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search or type command..."
                  className="dark:bg-dark-900 h-10 w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-11 pr-14 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[380px]"
                />
                <button
                  type="button"
                  onClick={() => inputRef.current?.focus()}
                  className="absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 px-1.5 py-1 text-xs text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400"
                >
                  <span>⌘</span>
                  <span>K</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Announcement Ticker (Desktop only) */}
          {activeAnnouncements.length > 0 && (
            <div className="hidden lg:flex items-center">
              <AnnouncementBadgeTicker announcements={activeAnnouncements} />
            </div>
          )}

          {/* School Treasury Balance Link (Desktop only) */}
          {showBalance && (
            <Link
              to="/expense-payments"
              title="School Treasury Balance — View Financial Records"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/30 dark:border-emerald-500/30 dark:hover:bg-emerald-950/50 transition-all duration-200 shadow-xs group"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 7.5V18a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 18V6a2.5 2.5 0 0 1 2.5-2.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18 3.5a2.5 2.5 0 0 1 2.5 2.5v1.5H16a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="17.5" cy="10.5" r=".75" fill="currentColor" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1 leading-none">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    School Balance
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white tabular-nums leading-tight mt-0.5">
                  {balanceLoading ? (
                    <span className="inline-block w-16 h-3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                  ) : balanceError ? (
                    <span className="text-xs text-red-500">RWF 0</span>
                  ) : (
                    formatCurrency(balance ?? 0)
                  )}
                </span>
              </div>
            </Link>
          )}

          {/* Role Badge (Desktop only on xl, accessible on mobile via toggle) */}
          {roleBadge && (
            <span
              className={`hidden xl:inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide whitespace-nowrap shadow-xs ${roleBadge.classes}`}
            >
              {roleBadge.label}
            </span>
          )}

          {/* Dark Mode Toggler (Always visible) */}
          <ThemeToggleButton />

          {/* Mobile Extra Menu Toggle (Only on mobile when balance or role badge exist) */}
          {(showBalance || roleBadge) && (
            <button
              type="button"
              onClick={toggleApplicationMenu}
              className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-gray-600 rounded-lg transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden ${
                isApplicationMenuOpen ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white" : ""
              }`}
              aria-label="Toggle options"
              title="View role and balance"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
          )}

          {/* User Profile Dropdown (Always visible on mobile & desktop) */}
          <UserDropdown />
        </div>
      </div>

      {/* Mobile Drawer (Only visible when toggled on mobile) */}
      {isApplicationMenuOpen && (
        <div className="flex flex-col gap-2.5 px-3 py-3 border-t border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-900/90 lg:hidden">
          {roleBadge && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Your Portal:</span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadge.classes}`}>
                {roleBadge.label}
              </span>
            </div>
          )}
          {showBalance && (
            <Link
              to="/expense-payments"
              onClick={() => setApplicationMenuOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-50/80 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:border-emerald-500/30 dark:hover:bg-emerald-950/60 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 7.5V18a2.5 2.5 0 0 1-2.5 2.5H5.5A2.5 2.5 0 0 1 3 18V6a2.5 2.5 0 0 1 2.5-2.5H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 3.5a2.5 2.5 0 0 1 2.5 2.5v1.5H16a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="17.5" cy="10.5" r=".75" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    School Treasury Balance
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                    {balanceLoading ? "..." : balanceError ? "RWF 0" : formatCurrency(balance ?? 0)}
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}

      {/* Mobile Announcement Bar (rendered directly below top row if announcements exist) */}
      {activeAnnouncements.length > 0 && (
        <AnnouncementBadgeTicker announcements={activeAnnouncements} isMobileBanner={true} />
      )}
    </header>
  );
};

export default AppHeader;

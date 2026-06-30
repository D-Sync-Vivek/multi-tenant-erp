import React, { useState, useEffect } from 'react';
import Sidebar from '../components/shared/Sidebar';
import TopNavbar from '../components/shared/TopNavbar';

export default function MainLayout({ children, title, headerActions }) {
  /*
    ── SIDEBAR SYNC ──
    We listen to the 'sidebar-toggle' custom event fired by Sidebar.jsx
    to know how much left margin the main content needs.

    Desktop expanded  → marginLeft = 288px (w-72)
    Desktop collapsed → marginLeft = 64px  (w-16)
    Tablet/Mobile     → marginLeft = 0px   (sidebar overlays, doesn't push)

    Threshold is 1280px (not 768px) because a fixed 288px push-margin on an
    iPad-width screen (768–1024px) leaves too little content width and
    squeezes multi-column grids (e.g. the 3 stat cards on the dashboard).
    Below 1280px the sidebar overlays content instead of pushing it.

    ── INITIAL STATE FIX ──
    Sidebar.jsx persists its expanded/collapsed state in localStorage under
    'student_sidebar_expanded'. Previously this component always started
    with sidebarExpanded = true and only corrected itself once a
    'sidebar-toggle' event fired (i.e. only after the user clicked the
    toggle button again). On a hard refresh while the sidebar was
    collapsed, no event fires, so this component kept assuming the sidebar
    was expanded (288px margin) while the actual sidebar rendered collapsed
    (64px wide) — causing the leftover blank gap seen after refresh.

    Fix: read the same localStorage key during initial state setup (lazy
    initializer), so on first render this already matches what Sidebar.jsx
    will render, with no flash/gap while waiting for an event.
  */
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    const stored = localStorage.getItem('student_sidebar_expanded');
    return stored !== null ? stored === 'true' : true;
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handler = (e) => setSidebarExpanded(e.detail.expanded);
    window.addEventListener('sidebar-toggle', handler);
    return () => window.removeEventListener('sidebar-toggle', handler);
  }, []);

  /*
    ── MARGIN LOGIC ──
    Mobile  → 0px   (sidebar slides OVER the content, not beside it)
    Desktop → 288px expanded | 64px collapsed
  */
  const marginLeft = isMobile
    ? '0px'
    : sidebarExpanded
      ? '288px'
      : '64px';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      <Sidebar />
      <main
        className="flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft, backgroundColor: 'var(--color-background)' }}
      >
        <TopNavbar title={title} headerActions={headerActions} />
        {/*
          flex-1 ensures the content area grows to fill remaining vertical space.
          overflow-x-hidden prevents any child from causing horizontal scroll.
        */}
        <div className="flex-1 overflow-x-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
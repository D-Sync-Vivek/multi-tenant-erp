import DashboardLayout from "../../components/erp/parent/DashboardLayout";
import StudentHeader from "../../components/erp/parent/StudentHeader";
import SummaryCards from "../../components/erp/parent/SummaryCards";
import PerformanceChart from "../../components/erp/parent/PerformanceChart";
import AllInsights from "../../components/erp/parent/AllInsights";
import CircularsPreview from "../../components/erp/parent/CircularsPreview";

const ParentDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">

        <StudentHeader />

        <SummaryCards />

        {/*
          Performance + AI insights + Circulars row.
          Key fix: switches to multi-column ONLY above 1400px width (an explicit
          arbitrary breakpoint, not the theme's 2xl token — this avoids any
          risk of 2xl being redefined lower in tailwind.config.js).
          1400px sits safely above iPad Pro landscape (1366px), Nest Hub Max
          (1280px), and Nest Hub (1024px) — so all of them stay in the
          single-column stacked view, exactly like iPad Air/Mini, and only
          true desktop widths go side-by-side.

          Grid is now 4 columns at the >=1400px breakpoint: PerformanceChart
          takes 2, AllInsights takes 1, CircularsPreview takes 1 — keeping
          AllInsights' own width unchanged from before.
        */}
        <section className="grid grid-cols-1 min-[1400px]:grid-cols-4 gap-4 sm:gap-6">
          <div className="min-[1400px]:col-span-2 min-h-[320px] sm:min-h-[380px]">
            <PerformanceChart />
          </div>
          <div className="min-[1400px]:col-span-1 min-h-[320px] sm:min-h-[380px]">
            <AllInsights />
          </div>
          <div className="min-[1400px]:col-span-1 min-h-[320px] sm:min-h-[380px]">
            <CircularsPreview />
          </div>
        </section>

      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
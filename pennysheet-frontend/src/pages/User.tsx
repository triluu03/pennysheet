import PageHeader from "../components/PageHeader";
import RegexRulesSection from "../components/RegexRulesSection";
import SessionsSection from "../components/SessionsSection";

/**
 * User settings page.
 */
export default function UserPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader title="User Settings" subtitle="Tri Luu" enableButtons={false} />
      <div className="flex flex-col flex-1 pb-5 rounded-lg gap-5">
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-medium mb-4">Profile</h2>
          <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm items-center">
            <span className="text-gray-500">Name</span>
            <span className="font-medium">Tri Luu</span>
            <span className="text-gray-500">Email</span>
            <span className="font-medium">ductriluu.work@gmail.com</span>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-medium mb-4">Preferences</h2>
          <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm items-center">
            <span className="text-gray-500">Currency</span>
            <span className="font-medium">EUR (€)</span>
            <span className="text-gray-500">Default view</span>
            <span className="font-medium">Monthly</span>
          </div>
        </section>

        <SessionsSection />

        <RegexRulesSection />

        <section className="rounded-xl border border-red-200 bg-white p-6">
          <h2 className="text-lg font-medium mb-4 text-red-700">Danger Zone</h2>
          <p className="text-sm text-gray-600 mb-4">
            This will delete all current projections and re-run the projectors over the full event
            history.
          </p>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600"
          >
            Reset projections
          </button>
        </section>
      </div>
    </div>
  );
}

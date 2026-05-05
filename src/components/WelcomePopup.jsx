import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function WelcomeModal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const justNow = searchParams.get('justNow') === 'true';
  if (!justNow) return null;

  const dismiss = () => {
    searchParams.delete('justNow');
    setSearchParams(searchParams);
  };

  const steps = [
    { label: 'Welcome', active: true },
    { label: 'Business Info' },
    { label: 'Agency Setup' },
    { label: 'Submit Claim' },
    { label: 'Approval' },
    { label: 'Finish' },
  ];

  const tags = ['Claim Submission', 'Agency Matching', 'Admin Approval', 'Status Tracking'];

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-900/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-3xl shadow-[0_25px_70px_rgba(0,0,0,0.35)]">

        {/* Steps */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {steps.map((step, i) => (
            <span
              key={step.label}
              className={`text-[11px] font-bold uppercase tracking-wider ${
                step.active ? 'text-blue-700' : 'text-slate-400'
              }`}
            >
              {i + 1} {step.label}
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="flex gap-10 items-center flex-col sm:flex-row">

          {/* Left */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-3">
              Welcome to Collections Connector 👋
            </h1>
            <p className="text-slate-500 leading-relaxed text-sm mb-3">
              Connect with trusted collection agencies, submit claims,
              and manage the entire recovery process in one secure platform.
            </p>
            <p className="text-slate-500 leading-relaxed text-sm mb-5">
              Our system ensures efficient matching, admin validation,
              and full transparency for both businesses and agencies.
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="bg-blue-700 text-white text-xs px-3 py-1.5 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center w-52 flex-shrink-0">
            <div className="w-20 h-20 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">CC</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Get Started</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Complete setup to begin submitting or reviewing claims.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={dismiss}
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-7 py-3 rounded-lg text-sm transition-colors"
          >
            Let's Get Started →
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
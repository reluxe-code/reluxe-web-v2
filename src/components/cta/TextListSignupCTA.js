// src/components/cta/TextListSignupCTA.js
import { useState } from "react";
import dynamic from "next/dynamic";

const SignupModal = dynamic(
  () =>
    import("@/components/promo/SignupModal").then((m) => m.default),
  { ssr: false, loading: () => null }
);

export default function TextListSignupCTA() {
  const [open, setOpen] = useState(false);

  return (
    <section className="w-full bg-black py-6 px-4 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        {/* Headline */}
        <div className="text-center md:text-left">
          <h2 className="mb-1 text-2xl font-semibold">Want exclusive deals?</h2>
          <p className="text-sm text-gray-300">
            Join our text list & get VIP-only specials straight to your phone.
          </p>
        </div>

        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
        >
          Join the Text List
        </button>
      </div>

      {/* Modal */}
      {open && <SignupModal open={open} onClose={() => setOpen(false)} />}
    </section>
  );
}

// src/components/finance/FinanceEstimator.js
import { useMemo, useState } from "react";
import Image from "next/image";

/* ------------------------ helpers ------------------------ */

const APR_12 = 0.1599;
const APR_24 = 0.1999;

// Currency shown like $1,234 (no decimals)
function currencyWhole(n) {
  if (isNaN(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
// Currency mild (two decimals)
function currency(n) {
  if (isNaN(n)) return "$0";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

// fixed “4 payments” for the 6-week plan
function compute6Week(amount) {
  const perPayment = amount / 4;
  return {
    apr: 0,
    financeCharge: 0,
    recurringLabel: `4 payments of ${currency(perPayment)}`,
    recurringShort: `${currency(perPayment)} × 4`,
  };
}

// standard amortized monthly payment
function monthlyPayment(principal, apr, months) {
  const r = apr / 12;
  if (r === 0) return principal / months;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

function computePlans(amount) {
  const a = Number(amount || 0);

  const six = compute6Week(a);

  const p12 = monthlyPayment(a, APR_12, 12);
  const chg12 = p12 * 12 - a;

  const p24 = monthlyPayment(a, APR_24, 24);
  const chg24 = p24 * 24 - a;

  return [
    {
      label: "6 Weeks",
      apr: "0.00% APR",
      financeCharge: 0,
      recurring: six.recurringLabel,
      noteRight: "0.00% APR",
    },
    {
      label: "12 Months",
      apr: "15.99% APR",
      financeCharge: chg12,
      recurring: `12 payments of ${currencyWhole(p12)}/month`,
      noteRight: "15.99% APR",
    },
    {
      label: "24 Months",
      apr: "19.99% APR",
      financeCharge: chg24,
      recurring: `24 payments of ${currencyWhole(p24)}/month`,
      noteRight: "19.99% APR",
    },
  ];
}

/* ------------------------ small UI bits ------------------------ */

function Chip({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm transition",
        active ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white hover:bg-gray-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-medium">{title}</span>
        <span className="ml-3 text-gray-500">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm text-gray-700">{children}</div>}
    </div>
  );
}

/* ------------------------ main component ------------------------ */

export default function FinanceEstimator({
  // MODE:
  // "service" = loads with first service price
  // "estimator" = user enters amount
  mode = "service",

  // Up to 5 services: [{ label: 'Morpheus8 Package (3)', price: 3000 }, ...]
  services = [
    { label: "30 Units of Jeuveau", price: 360 },
    { label: "Sculptra (1 vial)", price: 800 },
    { label: "Morpheus8 Package (3)", price: 3000 },
  ],

  // Left image & apply links
  imageSrc = "/images/cherry/cherry-promo.jpg",
  applyHref = "https://pay.withcherry.com/reluxe-med-spa",
  spendingHref = "https://pay.withcherry.com/reluxe-med-spa",

  // Preset amounts
  presets = [500, 1000, 1500, 2000],
}) {
  // Initial amount
  const initial = services?.[0]?.price || 500;
  const [amount, setAmount] = useState(String(initial));
  const [serviceIdx, setServiceIdx] = useState(0);

  // keep input numeric
  const handleAmountInput = (v) => {
    const onlyDigits = v.replace(/[^\d]/g, "");
    setAmount(onlyDigits);
  };

  // when user picks a service, sync the price
  const service = services[serviceIdx] || services[0];
  const useAmount = Number(amount || 0);
  const plans = useMemo(() => computePlans(useAmount), [useAmount]);

  // “As low as” (we’ll surface the lowest monthly figure — 24m)
  const asLowAsMonthly = useMemo(() => {
    const p24 = plans[2].recurring.match(/\$[\d,]+/g);
    return p24?.[0] || "$0";
  }, [plans]);

  return (
    <section className="relative">
      {/* green band */}
      <div className="absolute inset-0 -z-10 bg-emerald-50/70" />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          
          {/* LEFT — promo image card */}
          <div className="relative aspect-[5/5] md:aspect-[4/4] rounded-xl overflow-hidden shadow-sm ring-1 ring-black/5">
            <Image
              src={imageSrc}
              alt="Get care now, pay over time with Cherry"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <a
                href={applyHref}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-3 shadow"
              >
                Apply Instantly
              </a>
            </div>
          </div>

          {/* RIGHT — calculator */}
          <div className="md:col-span-2 rounded-xl border bg-white p-4 md:p-5 shadow-sm">
             {/* ribbon */}
              <div className="mb-4">
                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs md:text-sm font-medium">
                  0% APR on 6-week plans · No hard credit check
                </span>
              </div>
            {/* selectors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* service select */}
              <label className="block">
                <span className="block text-xs font-medium text-gray-600 mb-1">Choose a service</span>
                <select
                  className="w-full rounded-lg border px-3 py-2 bg-white"
                  value={serviceIdx}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setServiceIdx(idx);
                    setAmount(String(services[idx].price || 0));
                  }}
                >
                  {services.slice(0, 5).map((s, i) => (
                    <option key={s.label} value={i}>
                      {s.label} — {currencyWhole(s.price)}
                    </option>
                  ))}
                </select>
              </label>

              {/* amount input with $ prefix */}
              <label className="block relative">
                <span className="block text-xs font-medium text-gray-600 mb-1">Or enter an amount</span>
                <span className="pointer-events-none absolute left-3 top-[34px] select-none text-gray-500">
                  $
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={amount}
                  onChange={(e) => handleAmountInput(e.target.value)}
                  className="w-full rounded-lg border pl-7 pr-3 py-2 bg-white"
                  placeholder="0"
                />
              </label>
            </div>

            {/* as low as */}
            <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
              <div className="text-xs font-semibold text-gray-500 uppercase">As low as:</div>
              <div className="text-3xl md:text-4xl font-extrabold mt-1">
                {asLowAsMonthly} <span className="text-lg font-semibold text-gray-600">/ month</span>
              </div>
            </div>

            {/* compact plan list */}
            <div className="mt-3 divide-y rounded-lg border overflow-hidden">
              {/* 6 weeks */}
              <Row
                label="6 Weeks"
                financeCharge="$0.00 (0.00% APR)"
                recurring={plans[0].recurring}
                rightNote="0.00% APR"
              />
              {/* 12 months */}
              <Row
                label="12 Months"
                financeCharge={`${currency(plans[1].financeCharge)} (15.99% APR)`}
                recurring={plans[1].recurring}
                rightNote="15.99% APR"
              />
              {/* 24 months */}
              <Row
                label="24 Months"
                financeCharge={`${currency(plans[2].financeCharge)} (19.99% APR)`}
                recurring={plans[2].recurring}
                rightNote="19.99% APR"
              />
            </div>

            {/* disclaimer */}
            <p className="mt-3 text-[13px] text-gray-600">
              This is an example only. Your exact terms and APR may vary based on several factors, including credit.
              0% applies to 6-week plans; longer plans include interest. Applying has no impact on your credit score.
            </p>

            {/* CTAs */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={applyHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 font-medium shadow"
              >
                Apply with no impact to credit
              </a>
              <a
                href={spendingHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-gray-50 text-gray-900 border px-4 py-3 font-medium"
              >
                Check spending power
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------ row item ------------------------ */

function Row({ label, financeCharge, recurring, rightNote }) {
  return (
    <div className="grid grid-cols-12 items-center">
      <div className="col-span-5 md:col-span-6 px-3 py-3 text-sm font-medium">{label}</div>
      <div className="col-span-12 md:col-span-6 px-3 py-3 text-sm md:text-right text-gray-900">
        <span className="font-semibold">{recurring}</span>
        {rightNote ? <span className="ml-2 hidden md:inline text-gray-500">({rightNote})</span> : null}
      </div>
    </div>
  );
}

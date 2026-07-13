"use client";

// Swap this for your real ko-fi or Buy Me a Coffee page.
const TIP_LINK = "https://ko-fi.com/michaelboi";

export default function TipJar() {
  return (
    <div className="rounded-2xl border border-dashed border-[#1C1B19]/20 bg-[#FAF8F4] p-8 text-center">
      <h3 className="text-lg font-semibold">Like this app?</h3>
      <p className="mt-1 text-sm text-[#1C1B19]/60">
        It&apos;s free to use — if it&apos;s helped you, a tip keeps it running.
      </p>
      <a
        href={TIP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full bg-[#1C1B19] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-[#FAF8F4] transition-transform hover:scale-105"
      >
        Buy me a coffee ☕
      </a>
    </div>
  );
}

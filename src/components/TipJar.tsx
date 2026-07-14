"use client";

// Swap this for your real ko-fi or Buy Me a Coffee page.
const TIP_LINK = "https://ko-fi.com/michaelboi";

export default function TipJar() {
  return (
    <div className="rounded-3xl border-[3px] border-dashed border-[#251A14] bg-white p-8 text-center">
      <h3 className="text-lg font-extrabold text-[#251A14]">Like this app?</h3>
      <p className="mt-1 text-sm font-medium text-[#251A14]/60">
        It&apos;s free to use — if it&apos;s helped you, a tip keeps it running.
      </p>
      <a
        href={TIP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block rounded-full border-[3px] border-[#251A14] bg-[#FFB627] px-6 py-3 text-xs font-bold uppercase tracking-wide text-[#251A14] shadow-[4px_4px_0_0_#251A14] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#251A14]"
      >
        Buy me a coffee ☕
      </a>
    </div>
  );
}
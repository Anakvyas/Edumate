'use client'

type OcrPage = {
  page: number;
  text: string;
};

export default function RawOcrPreview({ ocrPages }: { ocrPages: OcrPage[] }) {
  if (!ocrPages.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#14191c] p-5 text-sm text-gray-400">
        Raw OCR preview is not available for this file.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1 custom-scroll">
      <div className="rounded-2xl border border-[#7dd87d]/20 bg-[#14191c] p-4 text-sm text-gray-300">
        This is the direct handwritten OCR capture before any study tools use it.
      </div>

      {ocrPages.map((page) => (
        <section
          key={page.page}
          className="rounded-2xl border border-white/10 bg-[#14191c] p-5 text-gray-200 shadow-md"
        >
          <div className="mb-3 text-xs uppercase tracking-[0.25em] text-[#7dd87d]">
            Page {page.page}
          </div>
          <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-200">
            {page.text}
          </pre>
        </section>
      ))}
    </div>
  );
}

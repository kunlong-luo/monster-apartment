'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#130c14] text-[#fae5c8] p-8 font-serif">
        <h2 className="text-xl font-bold text-[#f0c588]">工坊遇到异常</h2>
        <p className="mt-2 text-sm text-[#d4b99d]">请尝试重新载入或返回大厅。</p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-4 rounded border border-[#b68c61] bg-[#55313f] px-4 py-2 text-sm text-[#fae5c8]"
        >
          重新尝试
        </button>
      </body>
    </html>
  );
}

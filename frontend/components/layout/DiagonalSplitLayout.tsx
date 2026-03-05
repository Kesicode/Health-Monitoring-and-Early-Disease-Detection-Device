interface DiagonalSplitLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

export function DiagonalSplitLayout({ left, right }: DiagonalSplitLayoutProps) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Left — brand panel */}
      <div className="relative flex w-[45%] flex-col items-center justify-center bg-green-700 px-12 py-16 text-white">
        {left}
        {/* Diagonal clip */}
        <div
          className="absolute inset-y-0 right-0 w-24 bg-gray-50"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        />
      </div>
      {/* Right — form panel */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-10 py-16">
        {right}
      </div>
    </div>
  );
}

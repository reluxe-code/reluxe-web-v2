'use client';

import { useMemo } from 'react';

type Props = {
  filePath: string;
  className?: string;
};

export default function AdminImagePreview({ filePath, className = '' }: Props) {
  const url = useMemo(() => {
    if (!filePath) return '';
    return `/capture/api/file?path=${encodeURIComponent(filePath)}`;
  }, [filePath]);

  if (!url) return <div className={`animate-pulse rounded-lg bg-slate-200 ${className || 'h-24 w-24'}`} />;

  return (
    <img
      src={url}
      alt="Form capture"
      className={className || 'h-24 w-24 cursor-pointer rounded-lg border object-cover shadow-sm transition-transform hover:scale-110'}
      onClick={() => window.open(url, '_blank')}
    />
  );
}

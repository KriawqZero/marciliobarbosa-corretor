'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'

type ImageWithFallbackProps = Omit<ImageProps, 'onError'>

export function ImageWithFallback({
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-cinza-50">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-cinza-200"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
    )
  }

  return (
    <Image
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  )
}

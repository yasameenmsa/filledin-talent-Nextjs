'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface JobImageProps {
    src: string;
    alt: string;
    fallbackSrc?: string;
    className?: string;
    fill?: boolean;
}

export default function JobImage({
    src,
    alt,
    fallbackSrc = '/images/job-placeholder.png',
    className = '',
    fill = false
}: JobImageProps) {
    const [error, setError] = useState(false);

    return (
        <Image
            src={error || !src ? fallbackSrc : src}
            alt={alt}
            fill={fill}
            className={className}
            onError={() => {
                setError(true);
            }}
        />
    );
}

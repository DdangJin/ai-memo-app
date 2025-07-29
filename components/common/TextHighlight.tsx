'use client';

import { useMemo } from 'react';

interface TextHighlightProps {
  text: string;
  searchTerms: string[];
  className?: string;
  highlightClassName?: string;
}

export default function TextHighlight({
  text,
  searchTerms,
  className = '',
  highlightClassName = 'bg-yellow-200 dark:bg-yellow-800 font-medium',
}: TextHighlightProps) {
  // 하이라이트된 텍스트 생성
  const highlightedText = useMemo(() => {
    if (!text || !searchTerms.length) {
      return <span>{text}</span>;
    }

    // 검색어들을 정리하고 필터링
    const cleanTerms = searchTerms
      .filter(term => term && term.trim().length > 0)
      .map(term => term.trim())
      .filter((term, index, arr) => arr.indexOf(term) === index); // 중복 제거

    if (cleanTerms.length === 0) {
      return <span>{text}</span>;
    }

    // 모든 검색어를 하나의 정규식으로 결합 (대소문자 구분 없음)
    const escapedTerms = cleanTerms.map(
      term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // 특수문자 이스케이프
    );

    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

    // 텍스트를 분할
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) => {
          // 검색어에 매칭되는지 확인 (대소문자 구분 없음)
          const isHighlight = cleanTerms.some(
            term => part.toLowerCase() === term.toLowerCase()
          );

          if (isHighlight) {
            return (
              <span
                key={index}
                className={highlightClassName}
                aria-label={`검색어 매칭: ${part}`}
              >
                {part}
              </span>
            );
          }

          return part;
        })}
      </>
    );
  }, [text, searchTerms, highlightClassName]);

  return <span className={className}>{highlightedText}</span>;
}

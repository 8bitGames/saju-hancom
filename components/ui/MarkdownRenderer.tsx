"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  variant?: "default" | "chat";
}

// 마크다운 전처리 함수 - 볼드/이탤릭 정규화
function preprocessMarkdown(text: string): string {
  let processed = text;

  // 0. 유니코드 별표/따옴표 정규화 (LLM이 특수 유니코드 사용하는 경우)
  // fullwidth asterisk (＊) -> normal asterisk (*)
  processed = processed.replace(/＊/g, '*');
  // fancy quotes -> normal quotes
  processed = processed.replace(/['']/g, "'");
  processed = processed.replace(/[""]/g, '"');

  // 1. *** 를 ** 로 정규화 (삼중 별표 -> 이중 별표)
  processed = processed.replace(/\*\*\*([^*]+)\*\*\*/g, '**$1**');
  processed = processed.replace(/\*\*\*([^*]+)\*\*/g, '**$1**');
  processed = processed.replace(/\*\*([^*]+)\*\*\*/g, '**$1**');

  // 2. 볼드 패턴을 직접 마커로 변환 (마크다운 파서 우회)
  // 한글, 한자, 특수문자 포함된 복잡한 볼드도 처리
  processed = processed.replace(/\*\*([^*\n]+?)\*\*/g, (match, content) => {
    if (content.trim()) {
      return `⟦B⟧${content}⟦/B⟧`;
    }
    return match;
  });

  return processed;
}

// 볼드 마커를 React 요소로 변환
function renderBoldMarkers(text: string, boldClassName: string): React.ReactNode {
  if (typeof text !== 'string' || !text.includes('⟦B⟧')) {
    return text;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const regex = /⟦B⟧(.+?)⟦\/B⟧/g;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={key++} className={boldClassName}>
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

// children 내의 텍스트 노드에서 볼드 마커 처리
function processChildren(children: React.ReactNode, boldClassName: string): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return renderBoldMarkers(child, boldClassName);
    }
    if (React.isValidElement(child)) {
      const props = child.props as { children?: React.ReactNode };
      if (props.children) {
        return React.cloneElement(child as React.ReactElement<{ children?: React.ReactNode }>, {
          children: processChildren(props.children, boldClassName),
        });
      }
    }
    return child;
  });
}

export function MarkdownRenderer({ content, variant = "default" }: MarkdownRendererProps) {
  const isChat = variant === "chat";
  const processedContent = preprocessMarkdown(content);
  const boldClassName = `font-semibold ${isChat ? "text-[var(--accent)]" : "text-white"}`;

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className={`font-bold text-[var(--text-primary)] ${isChat ? "text-lg mt-3 mb-2" : "text-xl mt-6 mb-3"} first:mt-0`}>
              {processChildren(children, boldClassName)}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`font-bold text-[var(--text-primary)] ${isChat ? "text-base mt-2 mb-1" : "text-lg mt-5 mb-2"}`}>
              {processChildren(children, boldClassName)}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`font-bold text-[var(--text-primary)] ${isChat ? "text-sm mt-2 mb-1" : "text-base mt-4 mb-2"}`}>
              {processChildren(children, boldClassName)}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className={`font-bold text-[var(--accent)] ${isChat ? "text-sm mt-1 mb-0.5" : "text-sm mt-3 mb-1"}`}>
              {processChildren(children, boldClassName)}
            </h4>
          ),
          p: ({ children }) => (
            <p className={`text-[var(--text-secondary)] leading-relaxed ${isChat ? "text-sm mb-2 last:mb-0" : "mb-3"}`}>
              {processChildren(children, boldClassName)}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={`list-disc pl-5 space-y-1.5 text-[var(--text-secondary)] ${isChat ? "text-sm mb-2" : "mb-4"}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal pl-5 space-y-1.5 text-[var(--text-secondary)] ${isChat ? "text-sm mb-2" : "mb-4"}`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={`text-[var(--text-secondary)] leading-relaxed pl-1 ${isChat ? "text-sm" : ""}`}>
              {processChildren(children, boldClassName)}
            </li>
          ),
          strong: ({ children }) => (
            <strong className={boldClassName}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 border-[var(--accent)] pl-4 italic text-[var(--text-secondary)] ${isChat ? "my-2" : "my-3"}`}>
              {processChildren(children, boldClassName)}
            </blockquote>
          ),
          // 테이블 지원
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100 dark:bg-gray-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-sm font-semibold text-[var(--text-primary)] border-b border-gray-200 dark:border-gray-700">
              {processChildren(children, boldClassName)}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-[var(--text-secondary)]">
              {processChildren(children, boldClassName)}
            </td>
          ),
          // 코드 블록 지원
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm text-[var(--accent)]">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className={isChat ? "my-2" : "my-3"}>
              {children}
            </pre>
          ),
          // 수평선 지원
          hr: () => (
            <hr className={`border-gray-200 dark:border-gray-700 ${isChat ? "my-3" : "my-6"}`} />
          ),
          // 링크 지원
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              {children}
            </a>
          ),
          // 텍스트 노드 처리
          text: ({ children }) => {
            if (typeof children === 'string') {
              return renderBoldMarkers(children, boldClassName);
            }
            return children;
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

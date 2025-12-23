"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  variant?: "default" | "chat";
}

// 마크다운 전처리 함수 - bold 문법 정규화
function preprocessMarkdown(text: string): string {
  let processed = text;

  // 0. 인라인 불렛 포인트를 줄바꿈으로 변환
  // "문장입니다. *항목:" 패턴을 "문장입니다.\n\n* 항목:" 으로 변환
  // 문장 끝(. 또는 다 등) 뒤에 공백과 *가 오고 그 뒤에 텍스트가 오는 패턴
  processed = processed.replace(/([.다요음])(\s*)\*([^\s*])/g, '$1\n\n* $3');

  // 1. *** 를 ** 로 정규화 (***text** -> **text**)
  processed = processed.replace(/\*\*\*([^*]+)\*\*/g, '**$1**');
  processed = processed.replace(/\*\*([^*]+)\*\*\*/g, '**$1**');

  // 2. 콜론이 bold 안에 있는 경우 바깥으로 이동
  // **text:** -> **text**:
  // **text:상세** -> **text**:상세 (콜론 뒤에 내용이 있으면 분리)
  processed = processed.replace(/\*\*([^*:]+):\*\*/g, '**$1**:');
  processed = processed.replace(/\*\*([^*:]+):([^*]+)\*\*/g, '**$1**:$2');

  // 3. 괄호가 bold를 감싸는 경우 처리
  // **(text)** -> (**text**)
  processed = processed.replace(/\*\*\(([^)]+)\)\*\*/g, '(**$1**)');
  // **text(설명)** -> **text**(설명)
  processed = processed.replace(/\*\*([^*(]+)\(([^)]+)\)\*\*/g, '**$1**($2)');

  // 4. ** 주변의 따옴표를 bold 바깥으로 이동
  // **'text'** -> '**text**'
  // **"text"** -> "**text**"
  processed = processed.replace(/\*\*(['"])([^'"*]+)\1\*\*/g, '$1**$2**$1');

  // 5. **'text -> '**text  (여는 따옴표가 ** 다음에 바로 오는 경우)
  processed = processed.replace(/\*\*(['"])/g, '$1**');

  // 6. text'** -> text**' (닫는 따옴표가 ** 바로 앞에 오는 경우)
  processed = processed.replace(/(['"])\*\*/g, '**$1');

  // 7. ** 바로 뒤에 오는 특수문자 처리
  // **`text` -> `**text**`
  processed = processed.replace(/\*\*`([^`]+)`\*\*/g, '`**$1**`');

  // 8. **(text -> (**text 괄호가 ** 다음에 바로 오는 경우
  processed = processed.replace(/\*\*\(([^)]*[^)*])/g, '(**$1');

  // 9. text)** -> text**) 괄호가 ** 바로 앞에 오는 경우
  processed = processed.replace(/([^(*][^(]*)\)\*\*/g, '$1**)');

  // 10. 불균형한 ** 패턴 수정 - 열린 **가 닫히지 않은 경우
  // 라인 단위로 ** 개수 확인하고 홀수면 제거
  const lines = processed.split('\n');
  processed = lines.map(line => {
    const asteriskCount = (line.match(/\*\*/g) || []).length;
    if (asteriskCount % 2 !== 0) {
      // 홀수개면 마지막 **를 제거
      const lastIndex = line.lastIndexOf('**');
      if (lastIndex !== -1) {
        return line.substring(0, lastIndex) + line.substring(lastIndex + 2);
      }
    }
    return line;
  }).join('\n');

  // 11. ** 주변의 불필요한 공백 제거
  processed = processed.replace(/\*\*\s+/g, '**');
  processed = processed.replace(/\s+\*\*/g, '**');

  return processed;
}

export function MarkdownRenderer({ content, variant = "default" }: MarkdownRendererProps) {
  const isChat = variant === "chat";
  const processedContent = preprocessMarkdown(content);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className={`font-bold text-[var(--text-primary)] ${isChat ? "text-lg mt-3 mb-2" : "text-xl mt-6 mb-3"} first:mt-0`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`font-bold text-[var(--text-primary)] ${isChat ? "text-base mt-2 mb-1" : "text-lg mt-5 mb-2"}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`font-bold text-[var(--text-primary)] ${isChat ? "text-sm mt-2 mb-1" : "text-base mt-4 mb-2"}`}>
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className={`font-bold text-[var(--accent)] ${isChat ? "text-sm mt-1 mb-0.5" : "text-sm mt-3 mb-1"}`}>
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className={`text-[var(--text-secondary)] leading-relaxed ${isChat ? "text-sm mb-2 last:mb-0" : "mb-3"}`}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={`list-disc list-inside space-y-1 text-[var(--text-secondary)] ${isChat ? "text-sm mb-2" : "mb-3"}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`list-decimal list-inside space-y-1 text-[var(--text-secondary)] ${isChat ? "text-sm mb-2" : "mb-3"}`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={`text-[var(--text-secondary)] ${isChat ? "text-sm" : ""}`}>{children}</li>
          ),
          strong: ({ children }) => (
            <strong className={`font-bold ${isChat ? "text-[var(--accent)]" : "text-[var(--text-primary)]"}`}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 border-[var(--accent)] pl-4 italic text-[var(--text-secondary)] ${isChat ? "my-2" : "my-3"}`}>
              {children}
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
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-[var(--text-secondary)]">
              {children}
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
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { AssistantMarkdownProps } from "~types/interface/chat.interface";

export const AssistantMarkdown = memo(function AssistantMarkdown({
  text,
}: AssistantMarkdownProps) {
  const markdownComponents = useMemo(
    () => ({
      p: ({ children }: { children?: React.ReactNode }) => <p>{children}</p>,
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote className="markdown-blockquote">{children}</blockquote>
      ),
      strong: ({ children }: { children?: React.ReactNode }) => (
        <strong className="markdown-strong">{children}</strong>
      ),
      b: ({ children }: { children?: React.ReactNode }) => (
        <strong className="markdown-strong">{children}</strong>
      ),
      ol: ({ children }: { children?: React.ReactNode }) => (
        <ol className="markdown-ol">{children}</ol>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => (
        <ul className="markdown-ul">{children}</ul>
      ),
      li: ({ children }: { children?: React.ReactNode }) => (
        <li className="markdown-li">{children}</li>
      ),
      em: ({ children }: { children?: React.ReactNode }) => (
        <em className="markdown-em">{children}</em>
      ),
      code: ({
        className,
        children,
      }: {
        className?: string;
        children?: React.ReactNode;
      }) => {
        const isBlock = Boolean(className?.includes("language-"));

        return isBlock ? (
          <code className={className}>{children}</code>
        ) : (
          <code className="inline-code">{children}</code>
        );
      },
      pre: ({ children }: { children?: React.ReactNode }) => (
        <pre className="markdown-pre">{children}</pre>
      ),
      a: ({
        children,
        ...props
      }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
          {...props}
          className="markdown-link"
          target="_blank"
          rel="noreferrer"
        >
          {children}
        </a>
      ),
    }),
    [],
  );

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {text}
    </ReactMarkdown>
  );
});

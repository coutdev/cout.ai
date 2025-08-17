'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useState, useRef } from 'react';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

const CodeBlock = memo(({ children, className }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  
  const language = className?.replace(/language-/, '') || '';
  
  const handleCopy = async () => {
    const text = codeRef.current?.textContent || String(children);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      {language && (
        <div className="code-block-header">
          <span className="code-language">{language}</span>
          <button
            onClick={handleCopy}
            className="copy-button"
            title={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <ClipboardIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      )}
      <code ref={codeRef} className={className}>
        {children}
      </code>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

const MarkdownRenderer = memo(({ content, className = '' }: MarkdownRendererProps) => {
  const components: Components = {
    pre: ({ children, ...props }) => {
      const codeElement = children as React.ReactElement<CodeBlockProps>;
      if (codeElement?.type === 'code' && codeElement.props) {
        return <CodeBlock {...(codeElement.props as CodeBlockProps)} />;
      }
      return <pre {...props}>{children}</pre>;
    },
    code: ({ inline, children, className, ...props }: any) => {
      if (inline) {
        return (
          <code className="inline-code" {...props}>
            {children}
          </code>
        );
      }
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
    h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
    h5: ({ children }) => <h5 className="markdown-h5">{children}</h5>,
    h6: ({ children }) => <h6 className="markdown-h6">{children}</h6>,
    p: ({ children }) => <p className="markdown-p">{children}</p>,
    ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
    ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
    li: ({ children }) => <li className="markdown-li">{children}</li>,
    blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
    a: ({ href, children }) => (
      <a 
        href={href} 
        className="markdown-link" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="markdown-strong">{children}</strong>,
    em: ({ children }) => <em className="markdown-em">{children}</em>,
    hr: () => <hr className="markdown-hr" />,
    table: ({ children }) => (
      <div className="table-wrapper">
        <table className="markdown-table">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="markdown-thead">{children}</thead>,
    tbody: ({ children }) => <tbody className="markdown-tbody">{children}</tbody>,
    tr: ({ children }) => <tr className="markdown-tr">{children}</tr>,
    th: ({ children }) => <th className="markdown-th">{children}</th>,
    td: ({ children }) => <td className="markdown-td">{children}</td>,
  };

  return (
    <div className={`markdown-content text-lg leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer; 
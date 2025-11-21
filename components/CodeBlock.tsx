'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = 'json' }: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      customStyle={{
        margin: 0,
        padding: '1.25rem',
        height: '100%',
        fontSize: '0.875rem',
        background: 'transparent',
      }}
      PreTag="div"
    >
      {code}
    </SyntaxHighlighter>
  );
}


import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
  maxHeight?: number;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language, maxHeight = 300 }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="code-block" style={{ position: 'relative', margin: '8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', background: '#2d2d2d', borderRadius: '4px 4px 0 0' }}>
        {language && <span style={{ color: '#999', fontSize: '12px' }}>{language}</span>}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleCopy} style={{ cursor: 'pointer', background: 'none', border: 'none', color: copied ? '#4caf50' : '#999', fontSize: '12px' }}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#999', fontSize: '12px' }}>
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        </div>
      </div>
      <pre style={{ overflow: 'auto', maxHeight: collapsed ? maxHeight : 'none', margin: 0, padding: '8px', background: '#1e1e1e', borderRadius: '0 0 4px 4px' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

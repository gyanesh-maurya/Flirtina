// Markdown parser function
export const parseMarkdown = (text) => {
  let html = text;

  // Escape HTML first to prevent XSS, but preserve markdown
  html = html.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks (must be processed before inline code)
  html = html.replace(/```(\w+)?\n?([\s\S]*?)\n?```/g, (match, lang, code) => {
    const language = lang || 'text';
    return `<pre class="code-block"><code class="language-${language}">${code.trim()}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic text
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Numbered lists
  html = html.replace(/^\d+\.\s+(.*$)/gm, '<li class="numbered-list-item">$1</li>');
  html = html.replace(/(<li class="numbered-list-item">.*<\/li>)/s, '<ol class="numbered-list">$1</ol>');

  // Bullet lists
  html = html.replace(/^[-*+]\s+(.*$)/gm, '<li class="bullet-list-item">$1</li>');
  html = html.replace(/(<li class="bullet-list-item">.*<\/li>)/s, '<ul class="bullet-list">$1</ul>');

  // Line breaks (convert double newlines to paragraphs)
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  // Wrap in paragraph if not starting with a block element
  if (!html.startsWith('<h') && !html.startsWith('<p') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<pre')) {
    html = '<p>' + html + '</p>';
  }

  return html;
};

// Copy to clipboard utility
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    // You could add a toast notification here
  } catch (err) {
    console.error('Failed to copy text:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
    }
    document.body.removeChild(textArea);
  }
};

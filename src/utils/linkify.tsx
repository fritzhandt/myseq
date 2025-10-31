import React from 'react';

/**
 * Converts URLs in text to clickable links
 * Preserves line breaks and makes URLs blue, underlined, and clickable
 */
export const linkifyText = (text: string): React.ReactNode => {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split text by newlines to preserve line breaks
  const lines = text.split('\n');
  
  return (
    <>
      {lines.map((line, lineIndex) => {
        const parts = line.split(urlRegex);
        
        return (
          <React.Fragment key={lineIndex}>
            {parts.map((part, partIndex) => {
              // Check if this part is a URL
              if (urlRegex.test(part)) {
                return (
                  <a
                    key={partIndex}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:text-primary/80 transition-colors break-all"
                  >
                    {part}
                  </a>
                );
              }
              return <span key={partIndex}>{part}</span>;
            })}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
};

import { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useAISearchSuccessTracking } from '@/hooks/useAISearchSuccessTracking';

interface ContentLinkProps extends LinkProps {
  children: ReactNode;
}

export const ContentLink = ({ children, onClick, ...props }: ContentLinkProps) => {
  const { markContentLinkClick } = useAISearchSuccessTracking();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    markContentLinkClick();
    onClick?.(e);
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
};

interface ContentAnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

export const ContentAnchor = ({ children, onClick, ...props }: ContentAnchorProps) => {
  const { markContentLinkClick } = useAISearchSuccessTracking();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    markContentLinkClick();
    onClick?.(e);
  };

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
};

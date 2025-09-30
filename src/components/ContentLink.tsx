import { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';

interface ContentLinkProps extends LinkProps {
  children: ReactNode;
}

export const ContentLink = ({ children, ...props }: ContentLinkProps) => {
  return <Link {...props}>{children}</Link>;
};

interface ContentAnchorProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

export const ContentAnchor = ({ children, ...props }: ContentAnchorProps) => {
  return <a {...props}>{children}</a>;
};

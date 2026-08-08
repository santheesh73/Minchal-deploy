import React, { ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'lg',
  className = '',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-xl',
    md: 'max-w-3xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    full: 'max-w-full',
  };

  return (
    <main className={`w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </main>
  );
};

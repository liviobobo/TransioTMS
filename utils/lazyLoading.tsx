import { lazy, Suspense } from 'react';
import { ComponentType } from 'react';

interface LoadingComponentProps {
  message?: string;
}

const LoadingComponent = ({ message = 'Se încarcă...' }: LoadingComponentProps) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  </div>
);

export const createLazyPage = (importFunc: () => Promise<{ default: ComponentType<any> }>, loadingMessage?: string) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={<LoadingComponent message={loadingMessage} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export const createLazyComponent = (importFunc: () => Promise<{ default: ComponentType<any> }>, loadingMessage?: string) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => (
    <Suspense fallback={<LoadingComponent message={loadingMessage} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export { LoadingComponent };
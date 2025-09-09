import { createLazyComponent } from '@/utils/lazyLoading';

const LazyFileUpload = createLazyComponent(
  () => import('../FileUpload')
);

export default LazyFileUpload;
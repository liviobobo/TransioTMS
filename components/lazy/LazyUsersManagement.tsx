import { createLazyComponent } from '@/utils/lazyLoading';

const LazyUsersManagement = createLazyComponent(
  () => import('../settings/UsersManagement')
);

export default LazyUsersManagement;
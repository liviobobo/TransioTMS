import { createLazyComponent } from '@/utils/lazyLoading';

const LazyCursaForm = createLazyComponent(
  () => import('../CursaForm')
);

export default LazyCursaForm;
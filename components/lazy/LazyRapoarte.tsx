import { createLazyComponent } from '@/utils/lazyLoading';

// Lazy load all report components (using named exports)
export const LazyRaportDatorii = createLazyComponent(
  () => import('../rapoarte/RaportDatorii').then(module => ({ default: module.RaportDatorii })),
  'Se încarcă raportul datorii...'
);

export const LazyRaportReparatii = createLazyComponent(
  () => import('../rapoarte/RaportReparatii').then(module => ({ default: module.RaportReparatii })),
  'Se încarcă raportul reparații...'
);

export const LazyRaportVenituri = createLazyComponent(
  () => import('../rapoarte/RaportVenituri').then(module => ({ default: module.RaportVenituri })),
  'Se încarcă raportul venituri...'
);

export const LazyRaportSoferi = createLazyComponent(
  () => import('../rapoarte/RaportSoferi').then(module => ({ default: module.RaportSoferi })),
  'Se încarcă raportul șoferi...'
);

export const LazyRaportSelector = createLazyComponent(
  () => import('../rapoarte/RaportSelector').then(module => ({ default: module.RaportSelector })),
  'Se încarcă selectorul de rapoarte...'
);
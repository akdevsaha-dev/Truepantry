import { Leaf } from '@phosphor-icons/react';
import type { Product, VerdictLevel } from '@/lib/api';
import s from './workspace.module.css';

export const verdictLabels: Record<VerdictLevel, string> = {
  good: 'Good fit',
  caution: 'Caution',
  avoid: 'Not for you',
};

export const verdictClasses: Record<VerdictLevel, string> = {
  good: s.verdictGood,
  caution: s.verdictCaution,
  avoid: s.verdictAvoid,
};

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={s.pageHeading}>
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

// Open Food Facts gives us a photo for most packaged products. Fresh produce has none.
export function ProductImage({ product, small = false }: { product: Product; small?: boolean }) {
  return (
    <div className={`${s.productImage} ${small ? s.productImageSmall : ''}`}>
      {product.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image_url} alt={product.name} />
      ) : (
        <Leaf size={small ? 22 : 36} weight="light" aria-hidden="true" />
      )}
    </div>
  );
}

export function VerdictBadge({ level }: { level: VerdictLevel }) {
  return <span className={`${s.verdictBadge} ${verdictClasses[level]}`}>{verdictLabels[level]}</span>;
}

// Nutri-Score and Eco-Score go from a (best) to e, NOVA from 1 (unprocessed) to 4 (ultra-processed).
export function Scores({ product }: { product: Product }) {
  const scores = [
    product.nutri_grade && `Nutri-Score ${product.nutri_grade.toUpperCase()}`,
    product.eco_grade && `Eco-Score ${product.eco_grade.toUpperCase()}`,
    product.nova_group && `NOVA ${product.nova_group}`,
  ].filter(Boolean);
  if (!scores.length) return null;

  return (
    <p className={s.scores}>
      {scores.join(' · ')}
      {product.scores_source === 'llm' && <span> (estimated)</span>}
    </p>
  );
}

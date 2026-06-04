import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton, { SkeletonText, SkeletonCard, SkeletonTable, SkeletonAvatar, SkeletonStatCard } from '../Skeleton';

describe('Skeleton', () => {
  it('renders with default styles', () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('animate-pulse');
    expect(el).toHaveClass('h-4');
    expect(el).toHaveClass('w-32');
  });

  it('SkeletonText renders the right number of lines', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines.length).toBe(3);
  });

  it('SkeletonText with 1 line', () => {
    const { container } = render(<SkeletonText lines={1} />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines.length).toBe(1);
  });

  it('SkeletonCard renders', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('SkeletonTable renders correct number of rows', () => {
    const { container } = render(<SkeletonTable rows={3} cols={4} />);
    const rows = container.querySelectorAll('.flex.items-center.gap-4');
    expect(rows.length).toBe(3);
  });

  it('SkeletonAvatar has correct size', () => {
    const { container } = render(<SkeletonAvatar size="lg" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('w-12');
    expect(el).toHaveClass('h-12');
  });

  it('SkeletonStatCard renders', () => {
    const { container } = render(<SkeletonStatCard />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

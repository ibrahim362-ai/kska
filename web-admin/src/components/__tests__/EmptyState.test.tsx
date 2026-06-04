import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No items" description="Add some items to get started" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('Add some items to get started')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    const { container } = render(<EmptyState title="Empty" icon={() => <svg data-testid="custom-icon" />} />);
    expect(container.querySelector('[data-testid="custom-icon"]')).toBeInTheDocument();
  });

  it('uses variant icon by default', () => {
    const { container } = render(<EmptyState title="No users" variant="users" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    render(
      <EmptyState
        title="No posts"
        action={<button>Create post</button>}
      />
    );
    expect(screen.getByText('Create post')).toBeInTheDocument();
  });

  it('renders all 5 variants without crashing', () => {
    ['default', 'search', 'error', 'users', 'file'].forEach((variant) => {
      const { unmount } = render(<EmptyState title={`Variant ${variant}`} variant={variant as any} />);
      expect(screen.getByText(`Variant ${variant}`)).toBeInTheDocument();
      unmount();
    });
  });
});

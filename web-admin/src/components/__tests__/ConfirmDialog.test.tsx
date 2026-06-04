import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    title: 'Are you sure?',
    message: 'This cannot be undone.',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('renders nothing when closed', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders title and message when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} confirmText="Delete" />);
    fireEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('uses correct button style for danger variant', () => {
    render(<ConfirmDialog {...defaultProps} variant="danger" confirmText="Yes" />);
    const btn = screen.getByText('Yes');
    expect(btn).toHaveClass('bg-red-600');
  });

  it('uses correct button style for warning variant', () => {
    render(<ConfirmDialog {...defaultProps} variant="warning" confirmText="OK" />);
    expect(screen.getByText('OK')).toHaveClass('bg-amber-600');
  });

  it('uses correct button style for info variant', () => {
    render(<ConfirmDialog {...defaultProps} variant="info" confirmText="Got it" />);
    expect(screen.getByText('Got it')).toHaveClass('bg-blue-600');
  });

  it('disables buttons when loading', () => {
    render(<ConfirmDialog {...defaultProps} loading confirmText="Yes" />);
    expect(screen.getByText('Yes')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('calls onCancel when backdrop clicked', () => {
    const onCancel = vi.fn();
    const { container } = render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    // The backdrop has the class fixed inset-0
    const backdrop = container.querySelector('.fixed.inset-0')!;
    fireEvent.click(backdrop);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('renders Active status with correct classes', () => {
    render(<StatusBadge status="Active" />);
    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-emerald-700');
  });

  it('renders Inactive status correctly', () => {
    render(<StatusBadge status="Inactive" />);
    const badge = screen.getByText('Inactive');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-red-700');
  });

  it('defaults to Pending or general status colors if unrecognized', () => {
    render(<StatusBadge status="UnknownStatus" />);
    const badge = screen.getByText('UnknownStatus');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-zinc-700');
  });
});

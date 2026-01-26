/**
 * AdminTable Component Tests
 * Feature: comprehensive-testing
 * 
 * Tests for the AdminTable component used in admin interfaces
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminTable, { AdminTableColumn } from '@/components/admin/ui/AdminTable';

interface TestData {
  id: string;
  name: string;
  email: string;
  status: string;
  amount: number;
}

describe('AdminTable Component', () => {
  const mockData: TestData[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', amount: 100 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'pending', amount: 200 },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', status: 'inactive', amount: 150 },
  ];

  const mockColumns: AdminTableColumn<TestData>[] = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email' },
    { key: 'status', title: 'Status', align: 'center' },
    { key: 'amount', title: 'Amount', align: 'right' },
  ];

  describe('Rendering', () => {
    it('should render table with data', () => {
      render(<AdminTable data={mockData} columns={mockColumns} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      render(<AdminTable data={mockData} columns={mockColumns} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
    });

    it('should render empty state when no data', () => {
      render(<AdminTable data={[]} columns={mockColumns} />);

      expect(screen.getByText('No data available')).toBeInTheDocument();
    });

    it('should render custom empty state', () => {
      render(
        <AdminTable 
          data={[]} 
          columns={mockColumns} 
          empty={<div>Custom empty message</div>}
        />
      );

      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      const { container } = render(
        <AdminTable data={mockData} columns={mockColumns} loading={true} />
      );

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Custom Rendering', () => {
    it('should use custom render function for columns', () => {
      const columnsWithRender: AdminTableColumn<TestData>[] = [
        { key: 'name', title: 'Name' },
        { 
          key: 'status', 
          title: 'Status',
          render: (value) => <span data-testid="custom-status">{String(value).toUpperCase()}</span>
        },
      ];

      render(<AdminTable data={mockData} columns={columnsWithRender} />);

      expect(screen.getAllByTestId('custom-status')[0]).toHaveTextContent('ACTIVE');
    });
  });

  describe('Selection', () => {
    it('should render checkboxes when selectable', () => {
      render(<AdminTable data={mockData} columns={mockColumns} selectable={true} />);

      const checkboxes = screen.getAllByRole('checkbox');
      // 1 header checkbox + 3 row checkboxes
      expect(checkboxes).toHaveLength(4);
    });

    it('should not render checkboxes when not selectable', () => {
      render(<AdminTable data={mockData} columns={mockColumns} selectable={false} />);

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should toggle row selection on checkbox click', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();

      render(
        <AdminTable 
          data={mockData} 
          columns={mockColumns} 
          selectable={true}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First row checkbox

      expect(onSelectionChange).toHaveBeenCalledWith([mockData[0]]);
    });

    it('should toggle all selection on header checkbox click', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();

      render(
        <AdminTable 
          data={mockData} 
          columns={mockColumns} 
          selectable={true}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // Header checkbox

      expect(onSelectionChange).toHaveBeenCalledWith(mockData);
    });

    it('should deselect all when header checkbox clicked with all selected', async () => {
      const user = userEvent.setup();
      const onSelectionChange = jest.fn();

      render(
        <AdminTable 
          data={mockData} 
          columns={mockColumns} 
          selectable={true}
          selectedRows={mockData}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // Header checkbox

      expect(onSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Sorting', () => {
    it('should call onSort when sortable column header clicked', async () => {
      const user = userEvent.setup();
      const onSort = jest.fn();

      render(
        <AdminTable 
          data={mockData} 
          columns={mockColumns} 
          sortable={true}
          onSort={onSort}
        />
      );

      await user.click(screen.getByText('Name'));

      expect(onSort).toHaveBeenCalledWith('name', 'asc');
    });

    it('should toggle sort direction on subsequent clicks', async () => {
      const user = userEvent.setup();
      const onSort = jest.fn();

      render(
        <AdminTable 
          data={mockData} 
          columns={mockColumns} 
          sortable={true}
          onSort={onSort}
          sortColumn="name"
          sortDirection="asc"
        />
      );

      await user.click(screen.getByText('Name'));

      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('should show sort indicator for sorted column', () => {
      const { container } = render(
        <AdminTable 
          data={mockData} 
          columns={mockColumns} 
          sortable={true}
          sortColumn="name"
          sortDirection="asc"
        />
      );

      // ChevronUp icon should be present
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Row Click', () => {
    it('should call onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const onRowClick = jest.fn();

      render(
        <AdminTable 
          data={mockData} 
          columns={mockColumns} 
          onRowClick={onRowClick}
        />
      );

      const rows = screen.getAllByRole('row');
      await user.click(rows[1]); // First data row (index 0 is header)

      expect(onRowClick).toHaveBeenCalledWith(mockData[0], 0);
    });

    it('should not propagate click from checkbox to row', async () => {
      const user = userEvent.setup();
      const onRowClick = jest.fn();
      const onSelectionChange = jest.fn();

      render(
        <AdminTable 
          data={mockData} 
          columns={mockColumns} 
          selectable={true}
          onRowClick={onRowClick}
          onSelectionChange={onSelectionChange}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // First row checkbox

      expect(onSelectionChange).toHaveBeenCalled();
      expect(onRowClick).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <AdminTable 
          data={mockData} 
          columns={mockColumns} 
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should apply custom rowClassName as string', () => {
      render(
        <AdminTable 
          data={mockData} 
          columns={mockColumns} 
          rowClassName="custom-row"
        />
      );

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveClass('custom-row');
    });

    it('should apply custom rowClassName as function', () => {
      render(
        <AdminTable 
          data={mockData} 
          columns={mockColumns} 
          rowClassName={(row, index) => index === 0 ? 'first-row' : 'other-row'}
        />
      );

      const rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveClass('first-row');
      expect(rows[2]).toHaveClass('other-row');
    });

    it('should apply column alignment', () => {
      render(<AdminTable data={mockData} columns={mockColumns} />);

      // Status column should be centered
      const statusCells = screen.getAllByText(/active|pending|inactive/i);
      statusCells.forEach(cell => {
        expect(cell.closest('td')).toHaveClass('text-center');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<AdminTable data={mockData} columns={mockColumns} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data rows
    });

    it('should have accessible checkboxes', () => {
      render(<AdminTable data={mockData} columns={mockColumns} selectable={true} />);

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });
  });
});

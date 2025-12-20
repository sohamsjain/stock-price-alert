'use client';

import * as React from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Trade } from '@/types';
import { useTradesStore } from '@/store/tradesStore';
import { DataTable } from '@/components/trades/trades-table/data-table';
import { createTradesColumns } from '@/components/trades/trades-table/columns';
import { TradeDetails } from './TradeDetails';
import { TradeCommand } from './TradeCommand';
import { TradeCreateFormData, TradeUpdateFormData } from '@/lib/validations/trade';

export function TradesPage() {
  const {
    trades,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    fetchTrades,
    createTrade,
    updateTrade,
    deleteTrade,
    deleteMultipleTrades,
  } = useTradesStore();

  const [selectedTrade, setSelectedTrade] = React.useState<Trade | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [initialSearchQuery, setInitialSearchQuery] = React.useState('');
  const [formMode, setFormMode] = React.useState<'create' | 'edit' | 'duplicate'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);
  const [tradesToDelete, setTradesToDelete] = React.useState<Trade[]>([]);

  // Fetch trades on component mount
  React.useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Global keyboard shortcut handler
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isInputFocused = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.closest('[role="dialog"]') !== null;

      if (isInputFocused) return;

      // Check for alphanumeric key press
      const isAlphanumeric = /^[a-zA-Z0-9]$/.test(e.key);
      
      if (isAlphanumeric && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setInitialSearchQuery(e.key); // Capture the initial character
        setCommandOpen(true);
      }

      // Also handle common shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setInitialSearchQuery(''); // No initial query for keyboard shortcut
        setCommandOpen(true);
      }

      // Escape to close command
      if (e.key === 'Escape' && commandOpen) {
        setCommandOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandOpen]);

  const handleCreateNew = () => {
    setInitialSearchQuery(''); // No initial query for button click
    setCommandOpen(true);
  };

  const handleEdit = (trade: Trade) => {
    setSelectedTrade(trade);
    setFormMode('edit');
    setDetailsOpen(true);
  };

  const handleView = (trade: Trade) => {
    setSelectedTrade(trade);
    setFormMode('edit');
    setDetailsOpen(true);
  };

  const handleDuplicate = (trade: Trade) => {
    setSelectedTrade(trade);
    setFormMode('duplicate');
    setDetailsOpen(true);
  };

  const handleDelete = (trade: Trade) => {
    setTradesToDelete([trade]);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSelected = (selectedTrades: Trade[]) => {
    setTradesToDelete(selectedTrades);
    setBulkDeleteDialogOpen(true);
  };

  const handleInlineEdit = async (id: string, field: string, value: any) => {
    try {
      // Handle the special 'edit' case for opening the full edit form
      if (field === 'edit') {
        handleEdit(value as Trade);
        return;
      }

      // For inline edits, update the specific field
      const updateData: Partial<Trade> = { [field]: value };
      await updateTrade(id, updateData as TradeUpdateFormData);
      
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
    } catch (error) {
      toast.error(`Failed to update ${field}`);
      console.error('Inline edit error:', error);
    }
  };

  const confirmDelete = async () => {
    if (tradesToDelete.length === 1) {
      const success = await deleteTrade(tradesToDelete[0].id);
      if (success) {
        setDeleteDialogOpen(false);
        setTradesToDelete([]);
      }
    }
  };

  const confirmBulkDelete = async () => {
    const ids = tradesToDelete.map(trade => trade.id);
    const success = await deleteMultipleTrades(ids);
    if (success) {
      setBulkDeleteDialogOpen(false);
      setTradesToDelete([]);
    }
  };

  const handleCommandSubmit = async (data: TradeCreateFormData) => {
    try {
      const success = await createTrade(data);
      if (success) {
        setCommandOpen(false);
        toast.success('Trade created successfully');
      }
    } catch (error) {
      console.error('Command submission error:', error);
      toast.error('Failed to create trade');
    }
  };

  const handleDetailsSubmit = async (data: TradeCreateFormData | TradeUpdateFormData) => {
    try {
      if (formMode === 'create' || formMode === 'duplicate') {
        const success = await createTrade(data as TradeCreateFormData);
        if (success) {
          setDetailsOpen(false);
          setSelectedTrade(null);
        }
      } else if (formMode === 'edit' && selectedTrade) {
        const success = await updateTrade(selectedTrade.id, data as TradeUpdateFormData);
        if (success) {
          setDetailsOpen(false);
          setSelectedTrade(null);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const columns = React.useMemo(
    () => createTradesColumns({
      onEdit: handleInlineEdit,
      onDelete: handleDelete,
      onView: handleView,
      onDuplicate: handleDuplicate,
    }),
    []
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-6 space-y-6">
      <DataTable
        columns={columns}
        data={trades}
        onCreateNew={handleCreateNew}
        onDeleteSelected={handleDeleteSelected}
      />

      {/* Command Component for Quick Trade Creation */}
      <TradeCommand
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onSubmit={handleCommandSubmit}
        isLoading={isCreating}
        initialQuery={initialSearchQuery}
      />

      {/* Trade Details Form */}
      <TradeDetails
        trade={selectedTrade}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onSubmit={handleDetailsSubmit}
        isLoading={isUpdating}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-normal">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-normal">
              This action cannot be undone. This will permanently delete the trade for
              {tradesToDelete.length > 0 && ` "${tradesToDelete[0].symbol}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="text-xs font-normal">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="text-xs font-normal bg-rose-700 text-foreground hover:bg-rose-700/80"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-normal">Delete Multiple Trades</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-normal">
              This action cannot be undone. This will permanently delete {tradesToDelete.length} selected trades.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="text-xs font-normal">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={isDeleting}
              className="text-xs font-normal bg-rose-700 text-foreground hover:bg-rose-700/80"
            >
              {isDeleting ? 'Deleting...' : `Delete ${tradesToDelete.length} Trade(s)`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Trade } from '@/types';
import { useTradesStore } from '@/store/tradesStore';
import { DataTable } from '@/components/trades-table/data-table';
import { createTradesColumns } from '@/components/trades-table/columns';
import { TradeForm } from './TradeForm';
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
  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<'create' | 'edit' | 'duplicate'>('create');
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);
  const [tradesToDelete, setTradesToDelete] = React.useState<Trade[]>([]);

  // Fetch trades on component mount
  React.useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const handleCreateNew = () => {
    setSelectedTrade(null);
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEdit = (trade: Trade) => {
    setSelectedTrade(trade);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleView = (trade: Trade) => {
    // For now, open in edit mode but you could create a read-only view
    setSelectedTrade(trade);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleDuplicate = (trade: Trade) => {
    setSelectedTrade(trade);
    setFormMode('duplicate');
    setFormOpen(true);
  };

  const handleDelete = (trade: Trade) => {
    setTradesToDelete([trade]);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSelected = (selectedTrades: Trade[]) => {
    setTradesToDelete(selectedTrades);
    setBulkDeleteDialogOpen(true);
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

  const handleFormSubmit = async (data: TradeCreateFormData | TradeUpdateFormData) => {
    try {
      if (formMode === 'create' || formMode === 'duplicate') {
        const success = await createTrade(data as TradeCreateFormData);
        if (success) {
          setFormOpen(false);
          setSelectedTrade(null);
        }
      } else if (formMode === 'edit' && selectedTrade) {
        const success = await updateTrade(selectedTrade.id, data as TradeUpdateFormData);
        if (success) {
          setFormOpen(false);
          setSelectedTrade(null);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const columns = React.useMemo(
    () => createTradesColumns({
      onEdit: handleEdit,
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

      {/* Trade Form */}
      <TradeForm
        trade={selectedTrade}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
        mode={formMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trade
              {tradesToDelete.length > 0 && ` "${tradesToDelete[0].symbol}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
            <AlertDialogTitle>Delete Multiple Trades</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {tradesToDelete.length} selected trades.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : `Delete ${tradesToDelete.length} Trades`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
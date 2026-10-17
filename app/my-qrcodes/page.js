'use client';

import { useState } from 'react';
import {
  Search,
  RefreshCw,
  Copy,
  Download,
  Calendar,
  SortAsc,
  SortDesc,
  Check,
  Trash2,
  AlertTriangle,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  useQRCodes,
  useDeleteQRCode,
  useBulkDeleteQRCodes,
} from '@/hooks/use-qr';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Sidebar } from '../components/sidebar';

export default function MyQRCodesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [copied, setCopied] = useState(null);

  const { data: qrcodes = [], isLoading, isError, refetch, isFetching } = useQRCodes();
  const deleteQRCode = useDeleteQRCode();
  const bulkDeleteQRCodes = useBulkDeleteQRCodes();

  const filtered = qrcodes
    .filter((q) => {
      const t = searchTerm.toLowerCase();
      return (
        (q.title || '').toLowerCase().includes(t) ||
        (q.url || '').toLowerCase().includes(t)
      );
    })
    .sort((a, b) => {
      const av = new Date(a.createdAt).getTime();
      const bv = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? av - bv : bv - av;
    });

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadQR = (base64, title) => {
    const a = document.createElement('a');
    a.href = base64;
    a.download = `${title || 'qr-code'}.png`;
    a.click();
  };

  const bulkDownload = async () => {
    if (selected.length === 0) return;
    const zip = new JSZip();
    selected.forEach((id) => {
      const qr = qrcodes.find((q) => q._id === id);
      if (qr) {
        const base64 = qr.qrCode.split(',')[1];
        zip.file(`${qr.title || qr._id}.png`, base64, { base64: true });
      }
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'qrcodes.zip');
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    await bulkDeleteQRCodes.mutateAsync(selected, {
      onSuccess: () => {
        toast({ title: 'Deleted', description: 'Selected QR codes deleted' });
        setSelected([]);
        refetch();
      },
    });
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  return (
    <div className="flex min-h-dvh bg-background">
      <div className="md:w-72 w-0">
        <Sidebar />
      </div>
      <div className="space-y-8 p-4 md:p-8 flex-1">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">My QR Codes</h1>
            <p className="text-sm text-muted-foreground">Browse, filter and manage your saved QR codes</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', isFetching && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <section className="rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title or URL…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title="Toggle sort"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelected(
                    selected.length === filtered.length
                      ? []
                      : filtered.map((q) => q._id)
                  )
                }
              >
                {selected.length === filtered.length && filtered.length > 0
                  ? 'Deselect all'
                  : 'Select all'}
              </Button>
              {selected.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={bulkDownload}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download ({selected.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={handleBulkDelete}
                    disabled={bulkDeleteQRCodes.isPending}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete ({selected.length})
                  </Button>
                </>
              )}
            </div>
          </div>
          {filtered.length > 0 && (
            <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>{selected.length} of {filtered.length} selected</span>
              <span className="tabular-nums">{qrcodes.length} total</span>
            </div>
          )}
        </section>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-primary" />
              <span>Loading…</span>
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-semibold">Failed to load QR codes</h3>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border bg-card p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-base font-semibold">No QR codes found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'Create your first QR code in the QR Studio.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((qr) => (
              <div
                key={qr._id}
                onClick={() => toggleSelect(qr._id)}
                className={cn(
                  'group cursor-pointer rounded-lg border bg-card p-5 transition-colors hover:bg-muted/40',
                  selected.includes(qr._id) && 'border-primary'
                )}
              >
                <img
                  src={qr.qrCode}
                  alt={qr.title || 'QR Code'}
                  className="mx-auto w-40"
                />
                <div className="mt-4 space-y-1 text-center">
                  <h3 className="truncate text-sm font-medium">{qr.title || 'Untitled'}</h3>
                  <p className="truncate text-xs text-muted-foreground">{qr.url}</p>
                  <p className="text-[11px] text-muted-foreground">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    {new Date(qr.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(qr.url, qr._id);
                    }}
                  >
                    {copied === qr._id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadQR(qr.qrCode, qr.title);
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteQRCode.mutate(qr._id, {
                        onSuccess: () => {
                          toast({ title: 'Deleted', description: 'QR code deleted' });
                          refetch();
                        },
                      });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

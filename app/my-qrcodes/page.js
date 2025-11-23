'use client';

import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Spotlight } from '@/app/components/ui/spotlight';
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
  const { data, isLoading, isError, refetch, isFetching } = useQRCodes();
  const deleteQRCode = useDeleteQRCode();
  const bulkDeleteQRCodes = useBulkDeleteQRCodes();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc' || 'asc');
  const [copied, setCopied] = useState(null);
  const [selected, setSelected] = useState([]);

  const qrcodes = data || [];

  // --- Filtering & sorting ---
  const filtered = qrcodes
    .filter((qr) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        qr.title?.toLowerCase().includes(term) ||
        qr.url?.toLowerCase().includes(term) ||
        qr._id?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    });

  // --- Actions ---
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: 'Copied',
      description: 'QR URL copied to clipboard',
    });
  };

  const downloadQR = (qrCode, title) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `${title || 'qrcode'}.png`;
    link.click();
  };

  const bulkDownload = async () => {
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
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(filtered.map((q) => q._id));
  };

  const deselectAll = () => {
    setSelected([]);
  };

  return (
    <div className="flex ">
      <div className=" md:w-72 w-0 ">
        <Sidebar />
      </div>
      <div className="p-4 md:p-8 space-y-8 flex-1">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex md:items-center justify-between flex-col md:flex-row gap-4">
            <div>
              <h1 className="text-3xl font-bold">My QR Codes</h1>
              <p className="text-muted-foreground">
                Browse, filter and manage your generated QR codes
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <span className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Filters + Bulk actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Spotlight
            className="w-full"
            spotlightColor="rgba(59, 130, 246, 0.15)"
          >
            <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-sm">
              <CardContent className="md:p-6 p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search QR codes by title, URL, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                  >
                    {sortOrder === 'asc' ? (
                      <SortAsc className="h-4 w-4" />
                    ) : (
                      <SortDesc className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAll}>
                    Deselect
                  </Button>
                  {selected.length > 0 && (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={bulkDeleteQRCodes.isLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete (
                        {selected.length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={bulkDownload}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download (
                        {selected.length})
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </Spotlight>
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <span className="text-muted-foreground">Loading QR codes...</span>
          </div>
        ) : isError ? (
          <div className="text-red-500">Failed to load QR codes.</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No QR codes found.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
          >
            {filtered.map((qr) => (
              <Spotlight
                key={qr._id}
                className="w-full"
                spotlightColor="rgba(59, 130, 246, 0.08)"
              >
                <Card
                  className={`border-2 ${
                    selected.includes(qr._id)
                      ? 'border-primary'
                      : 'border-transparent'
                  } bg-card/40 backdrop-blur-sm cursor-pointer`}
                  onClick={() => toggleSelect(qr._id)}
                >
                  <CardContent className="p-6 flex flex-col items-center space-y-4">
                    <img
                      src={qr.qrCode}
                      alt={qr.title || 'QR Code'}
                      className="w-48 h-48"
                    />
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold truncate max-w-xs">
                        {qr.title || 'Untitled QR'}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {qr.url}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(qr.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(qr.url, qr._id);
                        }}
                      >
                        {copied === qr._id ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadQR(qr.qrCode, qr.title);
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQRCode.mutate(qr._id, {
                            onSuccess: () => {
                              toast({
                                title: 'Deleted',
                                description: 'QR code deleted',
                              });
                              refetch();
                            },
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Spotlight>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

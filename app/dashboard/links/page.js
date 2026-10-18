'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  Copy,
  BarChart3,
  Edit,
  Trash2,
  Clock,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  SortAsc,
  SortDesc,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUrls, useDeleteUrls, useUpdateUrlStatus } from '@/hooks/use-urls';
import { EditLinkSheet } from '@/app/components/edit-link-sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL;

const fullShort = (link) =>
  link.shortUrl?.startsWith('http')
    ? link.shortUrl
    : `${BASE_URL}/${link.shortUrl}`;

export default function MyLinksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [copied, setCopied] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const { toast } = useToast();

  const { data, isLoading: urlsLoading, isError, refetch, isFetching: refreshLoading } = useUrls();
  const { mutate: deleteUrls, isPending: isDeleting } = useDeleteUrls();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateUrlStatus();

  const links = data?.urls || [];

  const filteredLinks = links
    .filter((link) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (link?.title || '').toLowerCase().includes(q) ||
        (link?.fullUrl || '').toLowerCase().includes(q) ||
        (link?.shortUrl || '').toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'all' || link?.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const modifier = sortOrder === 'asc' ? 1 : -1;
      if (typeof aValue === 'string') return aValue.localeCompare(bValue) * modifier;
      return (aValue - bValue) * modifier;
    });

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast({ title: 'Copied', description: 'URL copied to clipboard' });
  };

  const deleteLink = (id) => {
    deleteUrls([id], {
      onSuccess: () => setSelectedLinks((prev) => prev.filter((sid) => sid !== id)),
    });
  };

  const bulkDelete = () => {
    if (selectedLinks.length === 0) return;
    const confirmed = confirm(`Delete ${selectedLinks.length} link${selectedLinks.length > 1 ? 's' : ''}?`);
    if (!confirmed) return;
    deleteUrls(selectedLinks, { onSuccess: () => setSelectedLinks([]) });
  };

  const toggleSelectLink = (id) => {
    setSelectedLinks((prev) =>
      prev.includes(id) ? prev.filter((linkId) => linkId !== id) : [...prev, id]
    );
  };

  const selectAllLinks = () => setSelectedLinks(filteredLinks.map((link) => link._id));
  const deselectAllLinks = () => setSelectedLinks([]);

  const exportLinks = () => {
    window.location.href = '/api/export/links';
    toast({ title: 'Exporting', description: 'CSV download starting…' });
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">My Links</h1>
          <p className="text-sm text-muted-foreground">Manage and track all your shortened URLs</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={refreshLoading}>
            <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', refreshLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Link href="/dashboard">
            <Button>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Link
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, URL, or short code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Paused</option>
            </select>
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
            <Button variant="outline" size="sm" onClick={exportLinks}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
            {selectedLinks.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive" disabled={isDeleting}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete ({selectedLinks.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedLinks.length} link{selectedLinks.length > 1 ? 's' : ''}?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={bulkDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        {filteredLinks.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={
                  selectedLinks.length === filteredLinks.length && filteredLinks.length > 0
                    ? deselectAllLinks
                    : selectAllLinks
                }
                className="font-medium text-foreground hover:underline"
              >
                {selectedLinks.length === filteredLinks.length && filteredLinks.length > 0
                  ? 'Deselect all'
                  : 'Select all'}
              </button>
              <span>
                {selectedLinks.length} of {filteredLinks.length} selected
              </span>
            </div>
            <span className="tabular-nums">{links.length} total</span>
          </div>
        )}
      </section>

      {/* Links list */}
      <div className="space-y-3">
        {urlsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-primary" />
              <span>Loading links…</span>
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="font-display text-base font-semibold">Failed to load links</h3>
            <p className="mt-1 text-sm text-muted-foreground">There was an error fetching your links.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="rounded-lg border bg-card p-10 text-center">
            <h3 className="font-display text-base font-semibold">No links found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'Create your first short URL to get started.'}
            </p>
            <Link href="/dashboard">
              <Button className="mt-4">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Link
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y overflow-hidden rounded-lg border bg-card">
            {filteredLinks.map((link) => (
              <div
                key={link._id}
                className="group flex items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/40 sm:px-5 sm:py-4"
              >
                <input
                  type="checkbox"
                  checked={selectedLinks.includes(link._id)}
                  onChange={() => toggleSelectLink(link._id)}
                  className="mt-1.5 cursor-pointer rounded border-border"
                  aria-label="Select link"
                />

                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="max-w-full truncate font-medium sm:max-w-sm">
                      {link.title || 'Untitled Link'}
                    </h3>
                    {link.status === 'inactive' && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        Paused
                      </Badge>
                    )}
                    {link.expiresAt && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        Expires
                      </Badge>
                    )}
                    {link.hasPassword && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        <Shield className="mr-1 h-3 w-3" />
                        Protected
                      </Badge>
                    )}
                    {(link.tags || []).slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="shrink-0 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <a
                    href={fullShort(link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm font-medium text-primary hover:underline"
                  >
                    {fullShort(link).replace(/^https?:\/\//, '')}
                  </a>
                  <p className="truncate text-xs text-muted-foreground" title={link.fullUrl}>
                    {link.fullUrl}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="tabular-nums">{link.clicks?.toLocaleString() || 0} clicks</span>
                    <span>{new Date(link.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button asChild size="sm" variant="outline" className="h-8">
                      <Link href={`/dashboard/analytics?link=${link._id}`}>
                        <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                        Analytics
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() => setEditingLink(link)}
                    >
                      <Edit className="mr-1.5 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8"
                      onClick={() =>
                        updateStatus({
                          id: link._id,
                          newStatus: link.status === 'active' ? 'inactive' : 'active',
                        })
                      }
                      disabled={isUpdating}
                    >
                      {link.status === 'active' ? (
                        <>
                          <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Eye className="mr-1.5 h-3.5 w-3.5" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteLink(link._id)}
                      className="h-8 text-destructive hover:text-destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 self-start">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(fullShort(link), link._id)}
                    className="h-8 w-8"
                    title="Copy"
                  >
                    {copied === link._id ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditLinkSheet
        link={editingLink}
        open={Boolean(editingLink)}
        onOpenChange={(open) => !open && setEditingLink(null)}
      />
    </div>
  );
}

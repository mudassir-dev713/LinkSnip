'use client';

import { useEffect, useState } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  FileText,
  QrCode,
  Link2,
  FolderClosed,
  Plus,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUrls } from '@/hooks/use-urls';
import { useFolders, useFolderMutations } from '@/hooks/useFolders';
import { ShortenForm } from '@/app/components/shorten-form';
import { LinkRow } from '@/app/components/link-row';
import { BulkShortener } from '@/app/components/bulk-shortener';
import { QuickQr } from '@/app/components/quick-qr';

const TOOLS = [
  { value: 'shorten', icon: Link2, label: 'Shorten' },
  { value: 'bulk', icon: FileText, label: 'Bulk' },
  { value: 'qr', icon: QrCode, label: 'QR code' },
];

const ALL = '__all__';
const UNFILED = '__none__';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('shorten');
  const [prefillUrl, setPrefillUrl] = useState('');
  const [origin, setOrigin] = useState('');
  const [folderFilter, setFolderFilter] = useState(ALL);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const {
    data,
    isLoading: urlsLoading,
    isError,
    refetch,
    isFetching: refreshLoading,
  } = useUrls();
  const { data: foldersData } = useFolders();
  const { createFolder } = useFolderMutations();

  const urls = data?.urls || [];
  const folders = foldersData?.folders || [];

  // Bookmarklet deep link: /dashboard?url=<current page>
  useEffect(() => {
    setOrigin(window.location.origin);
    const params = new URLSearchParams(window.location.search);
    const u = params.get('url');
    if (u) {
      setPrefillUrl(u);
      setActiveTab('shorten');
    }
  }, []);

  const folderName = (id) => folders.find((f) => f._id === id)?.name;
  const visibleUrls =
    folderFilter === ALL
      ? urls
      : folderFilter === UNFILED
        ? urls.filter((u) => !u.folder)
        : urls.filter((u) => u.folder === folderFilter);

  const handleCreateFolder = (e) => {
    e?.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    createFolder.mutate(name, {
      onSuccess: (folder) => {
        setNewFolderName('');
        setCreatingFolder(false);
        setFolderFilter(folder._id);
      },
    });
  };

  const bookmarkletHref = origin
    ? `javascript:void(window.open('${origin}/dashboard?url='+encodeURIComponent(location.href)))`
    : undefined;

  return (
    <div className="p-5 md:p-10 space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="space-y-1">
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">Create and manage your short links</p>
        </div>
        {!urlsLoading && urls.length > 0 && (
          <p className="text-sm tabular-nums text-muted-foreground">
            <span className="font-medium text-foreground">{urls.length}</span>{' '}
            {urls.length === 1 ? 'link' : 'links'}
          </p>
        )}
      </header>

      {/* Create — tools flow on the page background; the tab bar is the only chrome */}
      <section aria-label="Link tools">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-10 w-full justify-start gap-5 rounded-none border-b border-border bg-transparent p-0">
            {TOOLS.map((tool) => (
              <TabsTrigger
                key={tool.value}
                value={tool.value}
                className="h-10 rounded-none bg-transparent px-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground"
              >
                <tool.icon className="h-4 w-4 shrink-0 mr-1.5" />
                {tool.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="pt-6">
            <TabsContent value="shorten" className="mt-0">
              <ShortenForm autoFocus initialUrl={prefillUrl} />
            </TabsContent>
            <TabsContent value="bulk" className="mt-0">
              <BulkShortener />
            </TabsContent>
            <TabsContent value="qr" className="mt-0">
              <QuickQr urls={urls} isLoading={urlsLoading} />
            </TabsContent>
          </div>
        </Tabs>

        {origin && (
          <p className="mt-5 text-xs text-muted-foreground">
            Shorten any page —{' '}
            <a
              href={bookmarkletHref}
              onMouseDown={(e) => e.preventDefault()}
              title="Drag this link to your bookmarks bar"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              drag this to your bookmarks bar
            </a>
            , then click it on any page.
          </p>
        )}
      </section>

      {/* Recent links — one data surface, filtered by folder */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            {folderFilter === ALL
              ? 'Recent links'
              : folderFilter === UNFILED
                ? 'Unfiled links'
                : folderName(folderFilter) || 'Links'}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={refreshLoading}
              title="Refresh"
              aria-label="Refresh links"
            >
              <RefreshCw className={`h-4 w-4 ${refreshLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/dashboard/links">
              <Button variant="outline" size="sm">
                View all
              </Button>
            </Link>
          </div>
        </div>

        {/* Folder chips */}
        {!urlsLoading && (
          <div className="flex flex-wrap items-center gap-1.5">
            <FolderChip
              active={folderFilter === ALL}
              onClick={() => setFolderFilter(ALL)}
              count={urls.length}
            >
              All
            </FolderChip>
            {folders.map((f) => (
              <FolderChip
                key={f._id}
                active={folderFilter === f._id}
                onClick={() => setFolderFilter(f._id)}
                count={f.linkCount}
              >
                {f.name}
              </FolderChip>
            ))}
            {(urls.some((u) => !u.folder) || folderFilter === UNFILED) && (
              <FolderChip
                active={folderFilter === UNFILED}
                onClick={() => setFolderFilter(UNFILED)}
                count={urls.filter((u) => !u.folder).length}
              >
                Unfiled
              </FolderChip>
            )}
            {creatingFolder ? (
              <form onSubmit={handleCreateFolder} className="flex items-center gap-1">
                <Input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  maxLength={40}
                  className="h-8 w-36 text-sm"
                  aria-label="New folder name"
                />
                <Button type="submit" size="sm" className="h-8" disabled={createFolder.isPending}>
                  {createFolder.isPending ? '…' : 'Create'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  aria-label="Cancel"
                  onClick={() => {
                    setCreatingFolder(false);
                    setNewFolderName('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setCreatingFolder(true)}
                className="inline-flex h-8 items-center gap-1 rounded-full border border-dashed px-3 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                New folder
              </button>
            )}
          </div>
        )}

        {urlsLoading ? (
          <div className="divide-y overflow-hidden rounded-lg border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg bg-muted/40 py-10 text-center">
            <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-destructive" />
            <p className="text-sm text-muted-foreground">We couldn’t load your links.</p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-4">
              Try again
            </Button>
          </div>
        ) : visibleUrls.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center">
            <FolderClosed className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
            <p className="font-medium">
              {folderFilter === ALL ? 'No links yet' : 'Nothing in this folder'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {folderFilter === ALL
                ? 'Paste your first URL above to get started.'
                : 'Move links here from the edit dialog, or shorten a new one.'}
            </p>
          </div>
        ) : (
          <div className="divide-y overflow-hidden rounded-lg border">
            {visibleUrls.slice(0, 5).map((link) => (
              <LinkRow key={link._id} link={link} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FolderChip({ active, onClick, count, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors ${
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
      {typeof count === 'number' && (
        <span className="tabular-nums opacity-70">{count}</span>
      )}
    </button>
  );
}

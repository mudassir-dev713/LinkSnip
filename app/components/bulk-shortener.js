'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  Link,
  Download,
  X,
  Check,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { useBulkShorten } from '@/hooks/useBulkShorten';
import { BULK_MAX_BATCH, BULK_MAX_FILE_BYTES } from '@/lib/constants';

// Header tokens seen in Bitly / Short.io / generic CSV exports.
const URL_HEADERS = ['url', 'long_url', 'longurl', 'destination', 'destination_url', 'original_url', 'target_url', 'page_url', 'link'];
const ALIAS_HEADERS = ['custom_slug', 'slug', 'short_url', 'short_link', 'shorturl', 'alias', 'keyword'];
const BITLINK_HEADERS = ['bitlink', 'shortened_url', 'short_link_url'];
const TITLE_HEADERS = ['title', 'name', 'label'];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell);
      cell = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows;
}

function findColumn(headers, candidates) {
  for (const name of candidates) {
    const idx = headers.findIndex((h) => h.trim().toLowerCase() === name);
    if (idx !== -1) return idx;
  }
  return -1;
}

function aliasFromBitlink(value) {
  try {
    const u = new URL(value.trim());
    const seg = u.pathname.split('/').filter(Boolean).pop();
    return seg || null;
  } catch {
    return null;
  }
}

/**
 * Turn raw file content into { line, url, alias, title, csv } rows.
 * Headered CSVs (Bitly, Short.io, generic exports) are detected by column
 * names; otherwise every line is treated as a URL. `line` is the 1-based
 * physical line in the input so the preview can map back to the textarea.
 */
function extractEntries(content) {
  const cleaned = content.replace(/^\uFEFF/, '');
  if (!cleaned.trim()) return [];

  const firstLine = cleaned.split(/\r?\n/, 1)[0];
  const looksCsv = firstLine.includes(',');
  if (!looksCsv) {
    return cleaned
      .split(/\r?\n/)
      .map((line, i) => ({ line: i + 1, url: line.trim() }))
      .filter((r) => r.url)
      .map((r) => ({ ...r, alias: null, title: null, csv: false }));
  }

  const rows = parseCsv(cleaned);
  if (rows.length === 0) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase());
  const urlCol = findColumn(headers, URL_HEADERS);
  const aliasCol = findColumn(headers, ALIAS_HEADERS);
  const bitlinkCol = findColumn(headers, BITLINK_HEADERS);
  const titleCol = findColumn(headers, TITLE_HEADERS);
  const isHeaderRow = urlCol !== -1 || aliasCol !== -1 || bitlinkCol !== -1;

  if (!isHeaderRow) {
    // No recognized header — treat first column of every row as the URL.
    return rows
      .map((r, i) => ({ line: i + 1, url: (r[0] || '').trim(), alias: null, title: null, csv: true }))
      .filter((r) => r.url);
  }

  return rows
    .slice(1)
    .map((r, i) => {
      const url = (urlCol !== -1 ? r[urlCol] : r[0] || '').trim();
      let alias = null;
      if (aliasCol !== -1 && r[aliasCol]) {
        alias = r[aliasCol].trim();
        // Some tools put a full short URL in the slug column.
        if (alias.includes('/')) {
          const fromUrl = aliasFromBitlink(alias.includes('://') ? alias : `https://x/${alias}`);
          alias = fromUrl || alias.split('/').filter(Boolean).pop();
        }
      } else if (bitlinkCol !== -1 && r[bitlinkCol]) {
        alias = aliasFromBitlink(r[bitlinkCol]);
      }
      return {
        line: i + 2,
        url,
        alias: alias ? alias.toLowerCase().slice(0, 60) : null,
        title: titleCol !== -1 ? (r[titleCol] || '').trim() || null : null,
        csv: true,
      };
    })
    .filter((r) => r.url);
}

/** Returns an error message, or null when the URL is shortenable. */
function validateUrl(url) {
  if (!url) return 'Empty';
  if (!/^https?:\/\//i.test(url)) return 'Missing http:// or https://';
  try {
    new URL(url);
    return null;
  } catch {
    return 'Malformed URL';
  }
}

/** Split a validated URL into host + path for compact display. */
function urlParts(raw) {
  try {
    const u = new URL(raw);
    const host = u.host.replace(/^www\./, '');
    const path = `${u.pathname}${u.search}${u.hash}`;
    return { host, path: path === '/' ? '' : path };
  } catch {
    return { host: raw, path: '' };
  }
}

export function BulkShortener() {
  const [urls, setUrls] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [previewData, setPreviewData] = useState([]);
  const [importedCount, setImportedCount] = useState(0);
  const [droppedCount, setDroppedCount] = useState(0);
  const { toast } = useToast();
  const { bulkShorten, isLoading } = useBulkShorten();

  const validCount = previewData.filter((p) => p.isValid).length;
  const totalCount = previewData.length;
  const nearLimit = totalCount >= BULK_MAX_BATCH;
  const overLimit = droppedCount > 0;

  // Re-parse the text and refresh preview state. Never touches `urls` —
  // the textarea keeps whatever the user typed (blank lines, trailing
  // newline on Enter, etc.) so the caret doesn't jump around.
  const rebuild = useCallback((text) => {
    const all = extractEntries(text);
    const entries = all.slice(0, BULK_MAX_BATCH);
    setDroppedCount(Math.max(0, all.length - entries.length));
    setImportedCount(entries.filter((e) => e.alias).length);
    setShowResults(false);
    const seen = new Set();
    setPreviewData(
      entries.map((entry, index) => {
        const key = entry.url.toLowerCase();
        const isDupe = seen.has(key);
        seen.add(key);
        const reason = validateUrl(entry.url);
        return {
          id: entry.line ?? index,
          line: entry.line ?? index + 1,
          original: entry.url,
          alias: entry.alias,
          title: entry.title,
          isValid: !reason,
          reason,
          isDupe,
          fixable: !entry.csv && reason === 'Missing http:// or https://',
          short: null,
          status: 'pending',
        };
      })
    );
  }, []);

  // File import path — normalize the textarea to the cleaned URL list.
  const applyContent = useCallback(
    (content) => {
      const entries = extractEntries(content).slice(0, BULK_MAX_BATCH);
      const normalized = entries.map((e) => e.url).join('\n');
      setUrls(normalized);
      rebuild(normalized);
    },
    [rebuild]
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => applyContent(e.target.result || '');
      reader.readAsText(file);
    },
    [applyContent]
  );

  const onDropRejected = useCallback(() => {
    toast({
      title: 'File not accepted',
      description: `Use a .txt or .csv file under ${Math.round(BULK_MAX_FILE_BYTES / 1024)} KB.`,
      variant: 'destructive',
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: BULK_MAX_FILE_BYTES,
  });

  const handleUrlChange = (e) => {
    const newUrls = e.target.value;
    setUrls(newUrls);
    setImportedCount(0);
    setDroppedCount(0);
    if (newUrls.trim()) {
      rebuild(newUrls);
    } else {
      setPreviewData([]);
      setShowResults(false);
    }
  };

  const fixLine = (item) => {
    const lines = urls.split('\n');
    const i = item.line - 1;
    if (i < 0 || i >= lines.length || lines[i].trim() !== item.original) return;
    lines[i] = `https://${item.original}`;
    const next = lines.join('\n');
    setUrls(next);
    rebuild(next);
  };

  const handleShorten = async () => {
    // Only valid rows, capped at the batch limit (defense in depth).
    const entries = previewData
      .filter((item) => item.isValid)
      .slice(0, BULK_MAX_BATCH)
      .map((item) => (item.alias ? { url: item.original, alias: item.alias } : item.original));

    if (entries.length === 0) {
      toast({
        title: 'No valid URLs',
        description: 'Paste valid URLs starting with http:// or https://.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const submittedLines = previewData
        .filter((item) => item.isValid)
        .slice(0, BULK_MAX_BATCH)
        .map((item) => item.line);
      const response = await bulkShorten.mutateAsync(entries);
      const updatedResults = response.results.map((result, index) => ({
        ...result,
        id: submittedLines[index] ?? index,
        line: submittedLines[index] ?? index + 1,
        isDupe: false,
        status: result.status === 'success' ? 'completed' : 'error',
      }));

      setPreviewData(updatedResults);
      setShowResults(true);

      const failed = updatedResults.filter((r) => r.status === 'error').length;
      toast({
        title: response.truncated ? 'Batch limit reached' : 'Bulk shortening complete',
        description: response.truncated
          ? `Shortened ${response.processed} of ${response.total} URLs — ${BULK_MAX_BATCH} per batch. Run the rest in another batch.`
          : failed > 0
            ? `Shortened ${updatedResults.length - failed} of ${updatedResults.length} URLs — ${failed} failed.`
            : `Shortened ${updatedResults.length} URLs.`,
        variant: response.truncated ? 'destructive' : 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process URLs',
        variant: 'destructive',
      });
    }
  };

  const exportResults = () => {
    const escape = (v) => {
      const s = String(v ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csvContent = [
      ['Original URL', 'Alias', 'Short URL', 'Status'],
      ...previewData.map((r) => [r.original, r.alias || '', r.short || '', r.status]),
    ]
      .map((row) => row.map(escape).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shortened-urls.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setPreviewData([]);
    setUrls('');
    setImportedCount(0);
    setDroppedCount(0);
    setShowResults(false);
    setShowPreview(false);
  };

  const successCount = previewData.filter((p) => p.status === 'completed').length;
  const failedCount = previewData.filter((p) => p.status === 'error').length;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Toolbar — count + clear, right-aligned (the tab is the heading) */}
      {totalCount > 0 && (
        <div className="flex items-center justify-end gap-2">
          <Badge variant="secondary" className="tabular-nums">
            {totalCount} {totalCount === 1 ? 'URL' : 'URLs'}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={clearAll}
            aria-label="Clear all"
            title="Clear all"
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid flex-1 gap-6 lg:grid-cols-2">
        {/* ── Left: input ─────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 py-6 text-center transition-colors ${
              isDragActive
                ? 'border-primary/60 bg-primary/5'
                : 'border-border hover:border-primary/40 hover:bg-muted/20'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mb-2 h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop the file here' : 'Drop a file or click to upload'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              .txt or .csv · Bitly &amp; Short.io exports keep their slugs · max{' '}
              {Math.round(BULK_MAX_FILE_BYTES / 1024)} KB
            </p>
          </div>

          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or paste manually</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Textarea
              aria-label="URLs, one per line"
              placeholder={'https://example.com/page1\nhttps://example.com/page2'}
              value={urls}
              onChange={handleUrlChange}
              rows={7}
              className="resize-none font-mono text-sm"
            />
            {/* Counter — stays aligned with the textarea's right edge */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">One URL per line · Enter adds a line</span>
              <span
                className={`tabular-nums ${
                  overLimit || nearLimit ? 'text-amber-600 dark:text-amber-500' : 'text-muted-foreground'
                }`}
              >
                {totalCount} / {BULK_MAX_BATCH} URLs
              </span>
            </div>
            {overLimit && (
              <p className="inline-flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Batch limit is {BULK_MAX_BATCH} — {droppedCount} extra{' '}
                {droppedCount === 1 ? 'URL was' : 'URLs were'} dropped. Shorten these,
                then paste the rest.
              </p>
            )}
          </div>

          {/* Push actions to the bottom so both columns end on one line */}
          <div className="mt-auto flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setShowPreview((v) => !v)}
              disabled={totalCount === 0}
              className="shrink-0"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              {showPreview ? 'Hide preview' : 'Preview'}
            </Button>
            <Button
              onClick={handleShorten}
              disabled={isLoading || validCount === 0}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isLoading
                ? 'Shortening…'
                : `Shorten ${validCount || ''} ${validCount === 1 ? 'link' : 'links'}`.trim()}
            </Button>
          </div>
        </div>

        {/* ── Right: preview / results ────────────── */}
        <div className="flex flex-col gap-3">
          <div className="flex h-8 items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {showResults ? (
                'Results'
              ) : (
                <>
                  Preview
                  <span className="ml-2 font-normal">
                    {validCount} valid
                    {totalCount - validCount > 0 && ` · ${totalCount - validCount} need fixing`}
                  </span>
                </>
              )}
            </p>
            {showResults && (
              <Button variant="outline" size="sm" onClick={exportResults} className="h-8">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
            )}
          </div>

          <div
            className={`flex-1 overflow-hidden rounded-md border ${
              showPreview || showResults ? '' : 'border-dashed'
            }`}
          >
            {totalCount === 0 ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
                <Link className="mb-2 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  {showPreview || showResults
                    ? 'Nothing to show — add URLs on the left.'
                    : 'Added URLs appear here before you shorten.'}
                </p>
              </div>
            ) : !showPreview && !showResults ? (
              <div className="flex h-full min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
                <ClipboardList className="mb-2 h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  {totalCount} {totalCount === 1 ? 'URL' : 'URLs'} ready —
                  preview the list or hit Shorten.
                </p>
              </div>
            ) : (
              <div className="max-h-80 divide-y overflow-y-auto">
                {previewData.map((result, index) => {
                  const { host, path } = urlParts(result.original);
                  return (
                    <div
                      key={result.id ?? index}
                      className="flex items-start gap-2.5 px-3 py-2"
                    >
                      {/* Fixed-width line + status columns keep rows aligned */}
                      <span className="mt-0.5 w-6 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted-foreground/60">
                        {result.line}
                      </span>
                      <span className="mt-1 flex w-4 shrink-0 justify-center">
                        {showResults ? (
                          result.status === 'completed' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )
                        ) : result.isValid ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm leading-snug" title={result.original}>
                          <span className="font-medium">{host}</span>
                          {path && <span className="text-muted-foreground">{path}</span>}
                        </p>
                        {(result.alias ||
                          result.title ||
                          result.reason ||
                          result.error ||
                          result.short ||
                          result.isDupe ||
                          result.fixable) && (
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            {result.alias && (
                              <Badge variant="secondary" className="font-mono text-[10px]">
                                /{result.alias}
                              </Badge>
                            )}
                            {result.title && (
                              <span className="truncate text-[11px] text-muted-foreground">
                                {result.title}
                              </span>
                            )}
                            {result.isDupe && (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-amber-600 dark:text-amber-500"
                              >
                                duplicate
                              </Badge>
                            )}
                            {result.error && (
                              <span className="inline-flex min-w-0 items-center gap-1 text-xs text-destructive">
                                <span className="truncate">{result.error}</span>
                              </span>
                            )}
                            {!result.error && result.short && (
                              <span className="truncate text-xs text-primary">{result.short}</span>
                            )}
                            {!showResults && result.reason && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-destructive">
                                {result.reason}
                                {result.fixable && (
                                  <button
                                    type="button"
                                    onClick={() => fixLine(result)}
                                    className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:bg-muted/70"
                                  >
                                    Add https://
                                  </button>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Summary strip — flat inline stats, no nested box */}
          {totalCount > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <Stat label="Total" value={totalCount} />
              <Stat label="Valid" value={validCount} tone={validCount > 0 ? 'ok' : 'muted'} />
              {importedCount > 0 && <Stat label="With slugs" value={importedCount} />}
              {showResults && (
                <>
                  <Stat label="Shortened" value={successCount} tone="ok" />
                  <Stat label="Failed" value={failedCount} tone={failedCount > 0 ? 'bad' : 'muted'} />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone = 'default' }) {
  const toneClass =
    tone === 'ok'
      ? 'text-green-600 dark:text-green-500'
      : tone === 'bad'
        ? 'text-destructive'
        : 'text-foreground';
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-muted-foreground">{label}</span>
      <strong className={`tabular-nums ${toneClass}`}>{value}</strong>
    </span>
  );
}

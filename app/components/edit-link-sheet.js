'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Archive, Image as ImageIcon, BarChart3, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useFolders } from '@/hooks/useFolders';
import { useAnalytics } from '@/hooks/use-analytics';
import { countryName } from '@/lib/countries';

const NO_FOLDER = '__none__';
const MAX_AB_VARIANTS = 5;
const MAX_RULES = 20;

const RULE_CONDITIONS = [
  { value: 'device', label: 'Device', defaultValue: 'mobile' },
  { value: 'country', label: 'Country', defaultValue: 'US' },
  { value: 'browser', label: 'Browser', defaultValue: 'chrome' },
  { value: 'time', label: 'Time (hours)', defaultValue: '9-17' },
  { value: 'referrer', label: 'Referrer', defaultValue: '' },
];

/**
 * Compact 24-hour analytics strip shown at the bottom of the edit panel.
 * Clicks, visitors, top country and a device split — with a way through to
 * the full analytics page.
 */
function QuickAnalytics({ linkId }) {
  const { data, isLoading, isError } = useAnalytics(linkId, '24h');
  const devices = (data?.devices || []).filter((d) => d.count > 0).slice(0, 3);

  return (
    <div className="rounded-md bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" />
          Last 24 hours
        </p>
        <Link
          href={`/dashboard/analytics?link=${linkId}`}
          className="text-xs font-medium text-primary hover:underline"
        >
          Full analytics
        </Link>
      </div>
      {isLoading ? (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-5 w-10 animate-pulse rounded bg-muted" />
              <div className="h-3 w-14 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Analytics unavailable right now.
        </p>
      ) : (
        <>
          <dl className="mt-3 grid grid-cols-3 gap-3">
            <div className="min-w-0">
              <dd className="font-display text-xl tabular-nums">
                {(data?.periodClicks ?? 0).toLocaleString()}
              </dd>
              <dt className="text-[11px] text-muted-foreground">Clicks</dt>
            </div>
            <div className="min-w-0">
              <dd className="font-display text-xl tabular-nums">
                {(data?.uniqueVisitors ?? 0).toLocaleString()}
              </dd>
              <dt className="text-[11px] text-muted-foreground">Visitors</dt>
            </div>
            <div className="min-w-0">
              <dd className="truncate font-display text-xl">
                {data?.topCountry && data.topCountry !== 'Unknown'
                  ? countryName(data.topCountry)
                  : '—'}
              </dd>
              <dt className="text-[11px] text-muted-foreground">Top country</dt>
            </div>
          </dl>
          {devices.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {devices.map((d) => (
                <div key={d.type} className="flex items-center gap-2 text-[11px]">
                  <span className="w-14 shrink-0 text-muted-foreground">{d.type}</span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(4, d.percentage)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right tabular-nums text-muted-foreground">
                    {d.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Right-side edit panel for a short link: basics (title, alias, password,
 * active), folder move, UTM tags, A/B destinations, page archive, the
 * share-card preview, and a 24-hour analytics summary at the end. Saves
 * through PATCH /api/edit/{id} and PATCH /api/update-status.
 */
export function EditLinkSheet({ link, open, onOpenChange }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: foldersData } = useFolders({ enabled: open });
  const folders = foldersData?.folders || [];

  const [title, setTitle] = useState('');
  const [alias, setAlias] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [folder, setFolder] = useState(NO_FOLDER);
  const [utm, setUtm] = useState({ source: '', medium: '', campaign: '' });
  const [variants, setVariants] = useState([]);
  const [rules, setRules] = useState([]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newRule, setNewRule] = useState({
    condition: 'device',
    value: 'mobile',
    redirectUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [previewKey, setPreviewKey] = useState(0);

  const [archive, setArchive] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  useEffect(() => {
    if (link && open) {
      setTitle(link.title === 'Untitled Link' ? '' : link.title || '');
      setAlias(link.shortUrl || '');
      setPassword('');
      setActive(link.status !== 'inactive');
      setFolder(link.folder || NO_FOLDER);
      setUtm({
        source: link.utmSource || '',
        medium: link.utmMedium || '',
        campaign: link.utmCampaign || '',
      });
      setVariants(
        (link.abTesting || [])
          .filter((v) => v?.url)
          .map((v, i) => ({ id: `${i}-${v.url}`, url: v.url, weight: v.weight || 50 }))
      );
      setRules(
        (link.retargetingRules || []).map((r, i) => ({ ...r, id: `${i}-${r.condition}` }))
      );
      setShowRuleForm(false);
      setNewRule({ condition: 'device', value: 'mobile', redirectUrl: '' });
      setFieldErrors({});
      setArchive(null);
      setPreviewKey(0);
      fetchArchive();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link, open]);

  const fetchArchive = async () => {
    if (!link?._id) return;
    try {
      const res = await fetch(`/api/archive?linkId=${link._id}`);
      if (!res.ok) return;
      const data = await res.json();
      setArchive(data.archive || null);
    } catch {
      // Non-fatal.
    }
  };

  const handleArchiveNow = async () => {
    setArchiveLoading(true);
    try {
      const res = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId: link._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Archive failed');
      setArchive(data.archive);
      toast({ title: 'Page archived' });
    } catch (err) {
      toast({ title: 'Archive failed', description: err.message, variant: 'destructive' });
    } finally {
      setArchiveLoading(false);
    }
  };

  if (!link) return null;

  const addVariant = () => {
    if (variants.length >= MAX_AB_VARIANTS) return;
    setVariants([
      ...variants,
      { id: `${Date.now()}`, url: '', weight: 50 },
    ]);
  };

  const updateVariant = (id, patch) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const addRule = () => {
    if (!newRule.redirectUrl.trim()) return false;
    if (rules.length >= MAX_RULES) return false;
    setRules([...rules, { ...newRule, id: `${Date.now()}` }]);
    setNewRule({ condition: 'device', value: 'mobile', redirectUrl: '' });
    setShowRuleForm(false);
    return true;
  };

  const saveRetargeting = async (linkId) => {
    const payload = rules
      .map(({ id, ...rule }) => rule)
      .filter((r) => r.redirectUrl?.trim());
    if (payload.length === 0) {
      if ((link.retargetingRules || []).length === 0) return;
      const res = await fetch('/api/link-retargeting', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to clear retargeting rules');
      }
      return;
    }
    const res = await fetch('/api/link-retargeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkId, rules: payload }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to save retargeting rules');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      // Status toggle goes through its own endpoint.
      const statusChanged = (link.status !== 'inactive') !== active;
      if (statusChanged) {
        const res = await fetch('/api/update-status', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: link._id,
            status: active ? 'active' : 'inactive',
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || data.message || 'Failed to update status');
        }
      }

      const payload = {
        // Move + campaign tags + A/B destinations always round-trip.
        folder: folder === NO_FOLDER ? null : folder,
        utmSource: utm.source.trim() || null,
        utmMedium: utm.medium.trim() || null,
        utmCampaign: utm.campaign.trim() || null,
        abTesting: variants
          .filter((v) => v.url.trim())
          .map((v) => ({ url: v.url.trim(), weight: Number(v.weight) || 50 })),
      };
      if (title.trim() !== (link.title === 'Untitled Link' ? '' : link.title || '')) {
        payload.title = title.trim() || 'Untitled Link';
      }
      if (alias.trim() && alias.trim() !== link.shortUrl) {
        payload.shortUrl = alias.trim();
      }
      if (password) {
        payload.password = password;
      }

      const res = await fetch(`/api/edit/${link._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setFieldErrors(data.errors);
        throw new Error(
          data.errors ? 'Please fix the highlighted fields.' : data.error || 'Failed to save changes'
        );
      }

      // Retargeting rules persist through their own endpoint.
      await saveRetargeting(link._id);

      queryClient.invalidateQueries({ queryKey: ['urls'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics', link._id] });
      setPreviewKey((k) => k + 1);
      toast({ title: 'Link updated' });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-lg"
        onClick={(e) => e.stopPropagation()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="shrink-0 border-b px-6 py-5 pr-12">
          <SheetTitle className="font-display text-base">Edit link</SheetTitle>
          <SheetDescription className="break-all text-xs" title={link.fullUrl}>
            {link.fullUrl}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Basics */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Untitled Link"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-alias">Custom alias</Label>
              <div className="flex items-center gap-0 rounded-md border has-[:focus]:ring-2 has-[:focus]:ring-ring">
                <span className="pl-3 text-sm text-muted-foreground select-none">/</span>
                <Input
                  id="edit-alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="border-0 focus-visible:ring-0 rounded-l-none"
                />
              </div>
              {fieldErrors.shortUrl && (
                <p className="text-sm text-destructive" role="alert">
                  {fieldErrors.shortUrl}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Folder</Label>
                <Select value={folder} onValueChange={setFolder}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_FOLDER}>Unfiled</SelectItem>
                    {folders.map((f) => (
                      <SelectItem key={f._id} value={f._id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-password">
                  New password <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={link.hasPassword ? 'Protected — type to change' : 'No password'}
                  className="h-10"
                />
                {fieldErrors.password && (
                  <p className="text-sm text-destructive" role="alert">
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-md bg-muted/50 p-3">
              <div>
                <Label htmlFor="edit-active" className="cursor-pointer">
                  Link active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Inactive links show a disabled page to visitors.
                </p>
              </div>
              <Switch id="edit-active" checked={active} onCheckedChange={setActive} />
            </div>
          </div>

          {/* UTM */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Campaign tags (UTM)</Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                aria-label="UTM source"
                placeholder="Source (newsletter)"
                value={utm.source}
                onChange={(e) => setUtm({ ...utm, source: e.target.value })}
                className="h-10"
              />
              <Input
                aria-label="UTM medium"
                placeholder="Medium (email)"
                value={utm.medium}
                onChange={(e) => setUtm({ ...utm, medium: e.target.value })}
                className="h-10"
              />
              <Input
                aria-label="UTM campaign"
                placeholder="Campaign (spring)"
                value={utm.campaign}
                onChange={(e) => setUtm({ ...utm, campaign: e.target.value })}
                className="h-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Appended to the destination for analytics tools. Works with A/B
              variants off.
            </p>
          </div>

          {/* A/B destinations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">A/B destinations</Label>
              {variants.length < MAX_AB_VARIANTS && (
                <Button type="button" size="sm" variant="ghost" onClick={addVariant}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add variant
                </Button>
              )}
            </div>
            {variants.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Everyone goes to the destination above. Add variants to split
                traffic between pages and see the winner in analytics.
              </p>
            ) : (
              <div className="space-y-2">
                {variants.map((v, index) => (
                  <div key={v.id} className="flex items-center gap-2">
                    <Input
                      aria-label={`Variant ${index + 1} URL`}
                      placeholder="https://example.com/page-b"
                      value={v.url}
                      onChange={(e) => updateVariant(v.id, { url: e.target.value })}
                      className="h-10 flex-1"
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        aria-label={`Variant ${index + 1} weight`}
                        type="number"
                        min={1}
                        max={100}
                        value={v.weight}
                        onChange={(e) => updateVariant(v.id, { weight: e.target.value })}
                        className="h-10 w-16 text-center"
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 shrink-0"
                      aria-label={`Remove variant ${index + 1}`}
                      onClick={() => setVariants(variants.filter((x) => x.id !== v.id))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Weights are normalized automatically. Leave all variants empty
                  to disable the test.
                </p>
                {fieldErrors.abTesting && (
                  <p className="text-sm text-destructive" role="alert">
                    {fieldErrors.abTesting}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Retargeting rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-sm font-semibold">
                <Share2 className="h-3.5 w-3.5" />
                Retargeting
              </Label>
              {rules.length < MAX_RULES && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowRuleForm((s) => !s)}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add rule
                </Button>
              )}
            </div>
            {rules.length === 0 && !showRuleForm ? (
              <p className="text-xs text-muted-foreground">
                Send mobile, country, browser, time or referrer traffic to a
                different page. First match wins; otherwise the destination above
                is used.
              </p>
            ) : (
              <div className="space-y-2">
                {rules.length > 0 && (
                  <div className="divide-y overflow-hidden rounded-md border">
                    {rules.map((rule) => (
                      <div key={rule.id} className="flex items-center gap-2 px-3 py-2.5">
                        <div className="min-w-0 flex-1 text-xs">
                          <span className="text-muted-foreground">If </span>
                          <span className="font-medium capitalize">{rule.condition}</span>
                          <span className="text-muted-foreground"> is </span>
                          <span className="font-medium uppercase">{rule.value}</span>
                          <div className="truncate font-mono text-[11px] text-muted-foreground">
                            → {rule.redirectUrl}
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 shrink-0"
                          aria-label="Remove rule"
                          onClick={() => setRules(rules.filter((r) => r.id !== rule.id))}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {showRuleForm && (
                  <div className="space-y-3 rounded-md bg-muted/40 p-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Condition</Label>
                        <Select
                          value={newRule.condition}
                          onValueChange={(value) =>
                            setNewRule({
                              condition: value,
                              value:
                                RULE_CONDITIONS.find((c) => c.value === value)
                                  ?.defaultValue || '',
                              redirectUrl: newRule.redirectUrl,
                            })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RULE_CONDITIONS.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Value</Label>
                        {newRule.condition === 'device' ? (
                          <Select
                            value={newRule.value}
                            onValueChange={(value) => setNewRule({ ...newRule, value })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mobile">Mobile</SelectItem>
                              <SelectItem value="tablet">Tablet</SelectItem>
                              <SelectItem value="desktop">Desktop</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            aria-label="Rule value"
                            className="h-9"
                            placeholder={
                              newRule.condition === 'time'
                                ? '9-17 (hours, 0-23)'
                                : newRule.condition === 'country'
                                  ? 'US, GB, IN…'
                                  : newRule.condition === 'referrer'
                                    ? 'twitter.com'
                                    : 'chrome'
                            }
                            value={newRule.value}
                            onChange={(e) =>
                              setNewRule({ ...newRule, value: e.target.value })
                            }
                          />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Redirect to</Label>
                      <Input
                        aria-label="Rule redirect URL"
                        type="url"
                        className="h-9"
                        placeholder="https://example.com/special-offer"
                        value={newRule.redirectUrl}
                        onChange={(e) =>
                          setNewRule({ ...newRule, redirectUrl: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" onClick={addRule}>
                        Add rule
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowRuleForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Rules are evaluated top to bottom; the first match wins.
                </p>
              </div>
            )}
          </div>

          {/* Share preview + archive */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-semibold">
                <ImageIcon className="h-3.5 w-3.5" />
                Share preview
              </Label>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/og/${link._id}?v=${previewKey}`}
                alt="Social share preview card for this link"
                className="w-full rounded-md border object-cover"
                width={600}
                height={315}
              />
              <p className="text-xs text-muted-foreground">
                Shown when this link is shared on WhatsApp, Slack or X.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-semibold">
                <Archive className="h-3.5 w-3.5" />
                Page archive
              </Label>
              {archive && archive.status === 'ok' ? (
                <div className="space-y-2 rounded-md bg-muted/50 p-3">
                  <p className="truncate text-sm font-medium">
                    {archive.title || 'Untitled page'}
                  </p>
                  <p className="max-h-24 overflow-y-auto text-xs leading-relaxed text-muted-foreground">
                    {archive.excerpt || 'No text captured.'}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Archived {new Date(archive.archivedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {archive?.status === 'error'
                    ? `Last attempt failed: ${archive.error}`
                    : 'Snapshot the destination page so you still have its content if the link dies.'}
                </p>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleArchiveNow}
                disabled={archiveLoading}
              >
                <Archive className="mr-1 h-3.5 w-3.5" />
                {archiveLoading ? 'Archiving…' : archive ? 'Re-archive' : 'Archive page'}
              </Button>
            </div>
          </div>

          {/* Quick analytics */}
          <QuickAnalytics linkId={link._id} />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Copy,
  ExternalLink,
  BarChart3,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Spotlight } from '../../components/ui/spotlight';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { useUrls } from '@/context/urlContext';
import Link from 'next/link';

const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL;

export default function MyLinksPage() {
  const [links, setLinks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLinks, setSelectedLinks] = useState([]);
  const { urls, fetchUrlsFromAPI, setUrls } = useUrls();
  const [refreshLoading, setRefreshLoading] = useState(false);

  const handleRefresh = async () => {
    setRefreshLoading(true);
    await fetchUrlsFromAPI();
    setRefreshLoading(false);
  };

  useEffect(() => {
    if (Array.isArray(urls)) {
      setLinks(urls);
    }
  }, [urls]);

  const filteredLinks = links
    .filter((link) => {
      const matchesSearch =
        link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.originalUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.shortUrl?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' || link.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const modifier = sortOrder === 'asc' ? 1 : -1;

      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * modifier;
      }
      return (aValue - bValue) * modifier;
    });
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const updateUrlStatus = async (id, newStatus) => {
    try {
      const res = await fetch('/api/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUrls((prevUrls) => {
        const updatedUrls = prevUrls.map((url) =>
          url._id === id ? { ...url, status: newStatus } : url
        );

        localStorage.setItem('urls', JSON.stringify(updatedUrls));
        return updatedUrls;
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const deleteLink = async (idsToDelete) => {
    const ids = Array.isArray(idsToDelete) ? idsToDelete : [idsToDelete];

    try {
      const res = await fetch('/api/delete-url', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!res.ok) throw new Error('Failed to delete');

      const updatedLinks = links.filter((link) => !ids.includes(link._id));
      setLinks(updatedLinks);
      localStorage.setItem('urls', JSON.stringify(updatedLinks));
      setSelectedLinks([]);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const toggleSelectLink = (id) => {
    setSelectedLinks((prev) => {
      if (prev.includes(id)) {
        return prev.filter((linkId) => linkId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const selectAllLinks = () => {
    setSelectedLinks(filteredLinks.map((link) => link._id));
  };

  const deselectAllLinks = () => {
    setSelectedLinks([]);
  };

  const bulkDelete = async () => {
    if (selectedLinks.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedLinks.length} link(s)?`
    );
    if (!confirmed) return;

    await deleteLink(selectedLinks);
    setSelectedLinks([]);
  };

  const exportLinks = () => {
    const exported = filteredLinks.map((link) => {
      // Destructure unwanted fields and keep the rest
      const { _id, user, anonId, __v, ...rest } = link;
      // Format createdAt and updatedAt if present
      return {
        ...rest,
        ...(rest.createdAt && {
          createdAt: new Date(rest.createdAt).toLocaleString(),
        }),
        ...(rest.updatedAt && {
          updatedAt: new Date(rest.updatedAt).toLocaleString(),
        }),
      };
    });
    const dataStr = JSON.stringify(exported, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const linkElem = document.createElement('a');
    linkElem.href = url;
    linkElem.download = 'my-links.json';
    linkElem.click();
  };
  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Links</h1>
            <p className="text-muted-foreground">
              Manage and track all your shortened URLs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              title="Refresh links from server"
              disabled={refreshLoading}
            >
              {refreshLoading ? (
                <span className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Link href="/dashboard/">
              <Button className="bg-gradient-to-r from-primary to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Create New Link
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Spotlight className="w-full" spotlightColor="rgba(59, 130, 246, 0.15)">
          <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search links by title, URL, or short code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-11 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
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
                  <Button variant="outline" size="sm" onClick={exportLinks}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  {selectedLinks.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={bulkDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete ({selectedLinks.length})
                    </Button>
                  )}
                </div>
              </div>

              {/* Bulk Actions */}
              {filteredLinks.length > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={
                      selectedLinks.length === filteredLinks.length &&
                      filteredLinks.length > 0
                        ? deselectAllLinks
                        : selectAllLinks
                    }
                  >
                    {selectedLinks.length === filteredLinks.length &&
                    filteredLinks.length > 0
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {selectedLinks.length} of {filteredLinks.length} selected
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </Spotlight>
      </motion.div>

      {/* Links List */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4"
      >
        {filteredLinks.length === 0 ? (
          <Spotlight
            className="w-full"
            spotlightColor="rgba(139, 92, 246, 0.1)"
          >
            <Card className="border-0 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto bg-muted/50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No links found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Create your first shortened URL to get started'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    title="Refresh links from server"
                    disabled={refreshLoading}
                  >
                    {refreshLoading ? (
                      <span className="w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                  <Link href="/dashboard/">
                    <Button className="bg-gradient-to-r from-primary to-blue-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Link
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </Spotlight>
        ) : (
          filteredLinks.map((link, index) => (
            <motion.div
              key={link._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Spotlight
                className="w-full"
                spotlightColor="rgba(59, 130, 246, 0.08)"
              >
                <Card className="border-0 bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-6 flex gap-4 items-start">
                    <input
                      type="checkbox"
                      checked={selectedLinks.includes(link._id)}
                      onChange={() => toggleSelectLink(link._id)}
                      className="mt-1 rounded border-border"
                      aria-label={`Select link ${link.title}`}
                      value={link._id}
                    />

                    {/* Link Info */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg truncate">
                              {link.title}
                            </h3>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                link.status === 'active'
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-yellow-500/10 text-yellow-500'
                              }`}
                            >
                              {link.status}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-primary">
                                {link.shortUrl &&
                                  (link.shortUrl.startsWith('http')
                                    ? link.shortUrl
                                    : `${BASE_URL}/${link.shortUrl}`)}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  copyToClipboard(
                                    link.shortUrl &&
                                      (link.shortUrl.startsWith('http')
                                        ? link.shortUrl
                                        : `${BASE_URL}/${link.shortUrl}`)
                                  )
                                }
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              {link.shortUrl && (
                                <a
                                  href={
                                    link.shortUrl.startsWith('http')
                                      ? link.shortUrl
                                      : `${BASE_URL}/${link.shortUrl}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-6 w-6 p-0"
                                >
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </a>
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground truncate">
                              {link.fullUrl}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {link.tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 text-xs bg-muted/50 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Analytics
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateUrlStatus(
                                link._id,
                                link.status === 'active' ? 'inactive' : 'active'
                              )
                            }
                          >
                            {link.status === 'active' ? (
                              <>
                                <EyeOff className="h-3 w-3 mr-1" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteLink(link._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 text-sm text-muted-foreground pt-3 border-t border-border/50">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4" />
                          <span>{link.clicks?.toLocaleString()} clicks</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            <span>Created At </span>
                            {new Date(link.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {link?.lastClicked && (
                            <>
                              <Calendar className="h-4 w-4" />
                              <span>Last clicked {link?.lastClicked}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Spotlight>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}

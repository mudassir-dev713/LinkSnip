'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Search,
  Plus,
  Copy,
  ExternalLink,
  BarChart3,
  Edit,
  Trash2,
  Calendar,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  EllipsisVertical,
  Check,
  AlertTriangle,
  Clock,
  Shield,
} from 'lucide-react';
import { Spotlight } from '../../components/ui/spotlight';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useUrls, useDeleteUrls, useUpdateUrlStatus } from '@/hooks/use-urls';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Link from 'next/link';

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL;

export default function MyLinksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [showPassword, setShowPassword] = useState(null);
  const [copied, setCopied] = useState(null);
  const { toast } = useToast();

  const {
    data,
    isLoading: urlsLoading,
    isError,
    refetch,
    isFetching: refreshLoading,
  } = useUrls();
  
  const { mutate: deleteUrls, isPending: isDeleting } = useDeleteUrls();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateUrlStatus();

  const links = data?.urls || [];

  // Filter and sort links
  const filteredLinks = links
    .filter((link) => {
      const matchesSearch = link?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link?.fullUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link?.shortUrl?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || link?.status === filterStatus;
      
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

  // Copy to clipboard function
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    
    toast({
      title: 'Copied to clipboard',
      description: 'URL copied successfully',
    });
  };

  // Delete functions
  const deleteLink = (id) => {
    deleteUrls([id], {
      onSuccess: () => {
        setSelectedLinks((prev) => prev.filter((sid) => sid !== id));
      },
    });
  };

  const bulkDelete = () => {
    if (selectedLinks.length === 0) return;
    
    const confirmed = confirm(`Delete ${selectedLinks.length} link(s)?`);
    if (!confirmed) return;

    deleteUrls(selectedLinks, {
      onSuccess: () => {
        setSelectedLinks([]);
      },
    });
  };

  // Selection functions
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

  // Export function
  const exportLinks = () => {
    const exported = filteredLinks.map((link) => {
      const { _id, user, anonId, __v, ...rest } = link;
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
    
    toast({
      title: 'Exported',
      description: 'Your links have been downloaded',
    });
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
              onClick={() => refetch()}
              disabled={refreshLoading}
            >
              <RefreshCw 
                className={`h-4 w-4 mr-2 ${refreshLoading ? 'animate-spin' : ''}`} 
              />
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

      {/* Filters and Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Spotlight className="w-full" spotlightColor="rgba(59, 130, 246, 0.15)">
          <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search and Filter */}
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
                    <option value="inactive">Paused</option>
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete ({selectedLinks.length})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete{' '}
                            <span className="font-medium">{selectedLinks.length}</span>{' '}
                            link{selectedLinks.length > 1 ? 's' : ''}. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={bulkDelete}
                            className="bg-destructive text-white hover:bg-destructive/90"
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>

              {/* Selection Info */}
              {filteredLinks.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={
                        selectedLinks.length === filteredLinks.length && filteredLinks.length > 0
                          ? deselectAllLinks
                          : selectAllLinks
                      }
                    >
                      {selectedLinks.length === filteredLinks.length && filteredLinks.length > 0
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {selectedLinks.length} of {filteredLinks.length} selected
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Spotlight>
      </motion.div>

      {/* Links Grid */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4"
      >
        {/* Loading State */}
        {urlsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span>Loading links...</span>
            </div>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to Load Links</h3>
            <p className="text-muted-foreground mb-6">
              There was an error loading your links. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : filteredLinks.length === 0 ? (
          <Spotlight className="w-full" spotlightColor="rgba(139, 92, 246, 0.1)">
            <Card className="border-0 bg-card/40 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? 'No links found' : 'No links yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Create your first shortened URL to get started'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={refreshLoading}
                  >
                    <RefreshCw 
                      className={`h-4 w-4 mr-2 ${refreshLoading ? 'animate-spin' : ''}`} 
                    />
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
          <div className="space-y-4">
            {filteredLinks.map((link, index) => (
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
                    <CardContent className="p-6">
                      <div className="flex gap-4 items-start">
                        {/* Selection Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedLinks.includes(link._id)}
                          onChange={() => toggleSelectLink(link._id)}
                          className="mt-1 rounded border-border"
                          aria-label={`Select link ${link.title}`}
                        />

                        <div className="flex-1 min-w-0 space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg truncate">
                                  {link.title || 'Untitled Link'}
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
                                {link.expiresAt && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-orange-500" />
                                    <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full">
                                      Expires
                                    </span>
                                  </div>
                                )}
                                {link.password && (
                                  <div className="flex items-center gap-1">
                                    <Shield className="h-3 w-3 text-primary" />
                                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                      Protected
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* URL Display */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-primary break-all">
                                    {link.shortUrl.startsWith('http')
                                      ? link.shortUrl
                                      : `${BASE_URL}/${link.shortUrl}`}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        copyToClipboard(
                                          link.shortUrl.startsWith('http')
                                            ? link.shortUrl
                                            : `${BASE_URL}/${link.shortUrl}`,
                                          link._id
                                        )
                                      }
                                      className="h-7 w-7 p-0"
                                    >
                                      {copied === link._id ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <Link
                                      href={
                                        link.shortUrl.startsWith('http')
                                          ? link.shortUrl
                                          : `${BASE_URL}/${link.shortUrl}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  </div>
                                </div>

                                {/* Original URL */}
                                <p className="text-sm text-muted-foreground truncate max-w-xl">
                                  {link.fullUrl}
                                </p>

                                {/* Password Display */}
                                {link.password && (
                                  <p className="text-sm text-muted-foreground flex gap-2 items-center">
                                    <span>Password: </span>
                                    <span className="flex-1">
                                      {showPassword === link._id
                                        ? link.password
                                        : link.password
                                            ?.split('')
                                            ?.map((char, index) => <span key={index}>*</span>)}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setShowPassword(
                                          showPassword === link._id ? null : link._id
                                        )
                                      }
                                    >
                                      {showPassword === link._id ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </button>
                                  </p>
                                )}

                                {/* Tags */}
                                {link.tags?.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-block px-2 py-1 text-xs bg-muted/50 rounded-full mr-2"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                <div className="md:block hidden">
                                  <Link href={`/dashboard/analytics/${link._id}`}>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="justify-start"
                                    >
                                      <BarChart3 className="h-3 w-3 mr-2" />
                                      Analytics
                                    </Button>
                                  </Link>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="justify-start"
                                  >
                                    <Edit className="h-3 w-3 mr-2" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      updateStatus({
                                        id: link._id,
                                        newStatus: link.status === 'active' ? 'inactive' : 'active',
                                      })
                                    }
                                    disabled={isUpdating}
                                    className="justify-start"
                                  >
                                    {link.status === 'active' ? (
                                      <>
                                        <EyeOff className="h-3 w-3 mr-2" />
                                        Pause
                                      </>
                                    ) : (
                                      <>
                                        <Eye className="h-3 w-3 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteLink(link._id)}
                                    className="text-destructive justify-start"
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-3 w-3 mr-2" />
                                    Delete
                                  </Button>
                                </div>

                                {/* Mobile Menu */}
                                <div className="relative md:hidden">
                                  <button className="p-1">
                                    <EllipsisVertical className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <ExternalLink className="h-4 w-4" />
                                  <span>{link.clicks?.toLocaleString() || 0} clicks</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {new Date(link.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                {link.lastClicked && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>Last clicked {link.lastClicked}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Spotlight>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
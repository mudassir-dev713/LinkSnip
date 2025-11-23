'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
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
  Save,
  X,
  Check,
} from 'lucide-react';
import { Spotlight } from '../../components/ui/spotlight';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  useDeleteUrls,
  useUpdateLink,
  useUpdateUrlStatus,
  useUrls,
} from '@/hooks/use-urls';
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

const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL;

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
  const [editingLinkId, setEditingLinkId] = useState(null);
  const [formState, setFormState] = useState({
    title: '',
    fullUrl: '',
    password: '',
    shortUrl: '',
    tags: '', // if you’ll use it later
  });
  const [validationErrors, setValidationErrors] = useState({});
  const {
    mutateAsync: updateLink,
    isPending: isSaving,
    formErrors,
  } = useUpdateLink();

  const validateLinkData = (raw) => {
    const data = {
      title: raw.title?.trim() || '',
      fullUrl: raw.fullUrl?.trim() || '',
      shortUrl: raw.shortUrl?.trim() || '',
      password: raw.password ?? '',
      tags: raw.tags ?? '',
    };
    const errors = {};

    if (data.title.length > 100)
      errors.title = 'Title cannot exceed 100 characters';

    if (!/^https?:\/\//i.test(data.fullUrl)) {
      errors.fullUrl = 'URL must start with http:// or https://';
    } else {
      try {
        new URL(data.fullUrl);
      } catch {
        errors.fullUrl = 'Invalid URL';
      }
    }

    if (data.shortUrl && !/^[a-zA-Z0-9_-]+$/.test(data.shortUrl)) {
      errors.shortUrl = 'Alias can only contain letters, numbers, -, _';
    }

    if (data.password && data.password.length < 2) {
      errors.password = 'Password must be at least 2 characters';
    }

    if (data.tags) {
      const tooLong = data.tags
        .split(',')
        .map((t) => t.trim())
        .some((t) => t.length > 20);
      if (tooLong) errors.tags = 'Each tag must be under 20 characters';
    }

    return { errors, data };
  };
  const handleSave = async () => {
    const { errors, data: cleaned } = validateLinkData(formState);
    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      return;
    }

    try {
      await updateLink({
        id: editingLinkId,
        data: {
          title: formState.title.trim(),
          fullUrl: formState.fullUrl.trim(),
          password: formState.password || undefined,
          shortUrl: formState.shortUrl.trim() || undefined,
        },
      });
      setEditingLinkId(null);
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };
  const links = data?.urls || [];
  const filteredLinks = links
    .filter((link) => {
      const matchesSearch =
        link?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link?.fullUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link?.shortUrl?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' || link?.status === filterStatus;
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

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const deleteLink = (id) => {
    deleteUrls([id], {
      onSuccess: (data) => {
        toast({
          title: 'Deleted',
          description: 'Link deleted successfully',
        });
        setSelectedLinks((prev) => prev.filter((sid) => sid !== id));
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete link',
          variant: 'destructive',
        });
      },
    });
  };

  const bulkDelete = () => {
    if (selectedLinks.length === 0) return;

    deleteUrls(selectedLinks, {
      onSuccess: () => {
        toast({
          title: 'Deleted',
          description: `${selectedLinks.length} link(s) deleted successfully`,
        });
        setSelectedLinks([]);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete links',
          variant: 'destructive',
        });
      },
    });
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
  };
  const [openMenu, setOpenMenu] = useState(null); // track which menu is open

  // Optional: close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.menu-container')) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <div className="flex md:items-center justify-between flex-col md:flex-row gap-4">
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
              title="Refresh links from server"
              onClick={() => refetch()}
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Spotlight className="w-full" spotlightColor="rgba(59, 130, 246, 0.15)">
          <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-sm">
            <CardContent className="md:p-6 p-4">
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive bg-transparent"
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
                            <span className="font-medium">
                              {selectedLinks.length}
                            </span>{' '}
                            link
                            {selectedLinks.length > 1 ? 's' : ''}. This action
                            cannot be undone.
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

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4"
      >
        {urlsLoading ? (
          <div className="flex items-center justify-center h-64">
            <span className="text-muted-foreground">Loading links...</span>
          </div>
        ) : filteredLinks.length === 0 ? (
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
                    title="Refresh links from server"
                    onClick={() => refetch()}
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

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg truncate">
                              {editingLinkId === link._id ? (
                                <>
                                  <input
                                    type="text"
                                    value={formState.title}
                                    onChange={(e) =>
                                      setFormState({
                                        ...formState,
                                        title: e.target.value,
                                      })
                                    }
                                    className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Title"
                                  />
                                  {validationErrors.title && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {validationErrors.title}
                                    </p>
                                  )}
                                </>
                              ) : (
                                link.title || 'Untitled Link'
                              )}
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
                              {editingLinkId === link._id ? (
                                <div className="flex flex-col">
                                  <div>
                                    <span className="text-sm">{BASE_URL}/</span>
                                    <input
                                      type="text"
                                      value={formState.shortUrl}
                                      onChange={(e) =>
                                        setFormState({
                                          ...formState,
                                          shortUrl: e.target.value,
                                        })
                                      }
                                      className="w-32 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                                      placeholder="custom-alias"
                                    />
                                  </div>
                                  <div>
                                    {validationErrors.shortUrl && (
                                      <p className="text-xs text-red-500 mt-1">
                                        {validationErrors.shortUrl}
                                      </p>
                                    )}

                                    {formErrors.shortUrl && (
                                      <p className="text-xs text-red-500">
                                        {formErrors.shortUrl}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-sm font-medium text-primary">
                                  {link.shortUrl.startsWith('http')
                                    ? link.shortUrl
                                    : `${BASE_URL}/${link.shortUrl}`}
                                </span>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  copyToClipboard(
                                    link.shortUrl &&
                                      (link.shortUrl.startsWith('http')
                                        ? link.shortUrl
                                        : `${BASE_URL}/${link.shortUrl}`),
                                    link._id
                                  )
                                }
                                className="h-6 w-6 p-0"
                              >
                                {copied == link._id ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
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
                              {editingLinkId === link._id ? (
                                <>
                                  <input
                                    type="text"
                                    value={formState.fullUrl}
                                    onChange={(e) =>
                                      setFormState({
                                        ...formState,
                                        fullUrl: e.target.value,
                                      })
                                    }
                                    className="w-full text-sm border text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Full URL"
                                  />
                                  {formErrors.fullUrl && (
                                    <p className="text-xs text-red-500">
                                      {formErrors.fullUrl}
                                    </p>
                                  )}
                                  {validationErrors.fullUrl && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {validationErrors.fullUrl}
                                    </p>
                                  )}
                                </>
                              ) : (
                                link.fullUrl
                              )}
                            </p>
                            {editingLinkId === link._id ? (
                              <>
                                <input
                                  type="text"
                                  value={formState.password}
                                  onChange={(e) =>
                                    setFormState({
                                      ...formState,
                                      password: e.target.value,
                                    })
                                  }
                                  className="w-full text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
                                  placeholder="Password (optional)"
                                />
                                {validationErrors.password && (
                                  <p className="text-xs text-red-500 mt-1">
                                    {validationErrors.password}
                                  </p>
                                )}
                              </>
                            ) : (
                              link.password && (
                                <p className="text-sm text-muted-foreground truncate flex gap-8 items-center">
                                  <div>
                                    Password: &nbsp;
                                    {showPassword === link._id
                                      ? link?.password
                                      : link?.password
                                          ?.split('')
                                          ?.map((char, index) => (
                                            <span key={index}>*</span>
                                          ))}
                                  </div>
                                  <span
                                  // onClick={() =>
                                  //   setShowPassword(!showPassword)
                                  // }
                                  >
                                    {showPassword === link._id ? (
                                      <EyeOff
                                        className="h-4 w-4"
                                        onClick={() => setShowPassword(null)}
                                      />
                                    ) : (
                                      <Eye
                                        className="h-4 w-4"
                                        onClick={() =>
                                          setShowPassword(link._id)
                                        }
                                      />
                                    )}
                                  </span>
                                </p>
                              )
                            )}

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

                        <div className="flex items-center gap-2">
                          <div className="md:block hidden">
                            {editingLinkId === link._id ? null : (
                              <Link href={`/dashboard/analytics/${link._id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="justify-start"
                                >
                                  <BarChart3 className="h-3 w-3 mr-2" />{' '}
                                  Analytics
                                </Button>
                              </Link>
                            )}
                            {editingLinkId === link._id ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="justify-start"
                                  onClick={handleSave}
                                  disabled={isSaving}
                                >
                                  <Save className="h-3 w-3 mr-2" /> Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingLinkId(null)}
                                >
                                  <X className="h-3 w-3 mr-2" /> Cancel
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="justify-start"
                                onClick={() => {
                                  setEditingLinkId(link._id);
                                  let alias = '';
                                  if (link.shortUrl) {
                                    try {
                                      // If absolute URL -> take pathname without leading slash
                                      const u = new URL(
                                        link.shortUrl,
                                        BASE_URL
                                      );
                                      alias =
                                        u.origin === BASE_URL
                                          ? u.pathname.replace(/^\//, '')
                                          : u.pathname.replace(/^\//, '');
                                    } catch {
                                      alias = link.shortUrl
                                        .replace(`${BASE_URL}/`, '')
                                        .replace(/^\//, '');
                                    }
                                  }
                                  setFormState({
                                    title: link.title || '',
                                    fullUrl: link.fullUrl || '',
                                    password: link.password || '',
                                    shortUrl: alias || '',
                                  });
                                }}
                              >
                                <Edit className="h-3 w-3 mr-2" /> Edit
                              </Button>
                            )}
                            {editingLinkId === link._id ? null : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateStatus({
                                    id: link._id,
                                    newStatus:
                                      link.status === 'active'
                                        ? 'inactive'
                                        : 'active',
                                  })
                                }
                                disabled={isUpdating}
                                className="justify-start"
                              >
                                {link.status === 'active' ? (
                                  <>
                                    <EyeOff className="h-3 w-3 mr-2" /> Pause
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3 w-3 mr-2" /> Activate
                                  </>
                                )}
                              </Button>
                            )}
                            {editingLinkId === link._id ? null : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteLink(link._id)}
                                className="text-destructive justify-start"
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-3 w-3 mr-2" /> Delete
                              </Button>
                            )}
                          </div>
                          <div className="relative menu-container md:hidden block">
                            <button
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === link._id ? null : link._id
                                )
                              }
                              className="p-1"
                            >
                              <EllipsisVertical className="h-5 w-5" />
                            </button>

                            {openMenu === link._id && (
                              <div className="absolute  right-0 top-full  bg-card border border-border rounded-md shadow-lg flex flex-col w-40 z-50">
                                <Link href={`/dashboard/analytics/${link._id}`}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="justify-start"
                                  >
                                    <BarChart3 className="h-3 w-3 mr-2" />{' '}
                                    Analytics
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="justify-start"
                                >
                                  <Edit className="h-3 w-3 mr-2" /> Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    updateStatus({
                                      id: link._id,
                                      newStatus:
                                        link.status === 'active'
                                          ? 'inactive'
                                          : 'active',
                                    })
                                  }
                                  disabled={isUpdating}
                                  className="justify-start"
                                >
                                  {link.status === 'active' ? (
                                    <>
                                      <EyeOff className="h-3 w-3 mr-2" /> Pause
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-3 w-3 mr-2" /> Activate
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
                                  <Trash2 className="h-3 w-3 mr-2" /> Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

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

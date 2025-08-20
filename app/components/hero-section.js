'use client';

import { motion } from 'framer-motion';
import { Copy, ExternalLink, BarChart3, Settings, Plus } from 'lucide-react';
import { useState } from 'react';
import { Spotlight } from './ui/spotlight';
import { Spotlight as SpotlightNew } from './ui/spotlight-new';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Balancer from 'react-wrap-balancer';
import { useShortenUrl } from '@/hooks/useShortenUrl';

export function HeroSection() {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [Error, setError] = useState(false);

  const shortenMutation = useShortenUrl();

  const handleShorten = () => {
    if (!url) {
      toast({
        title: 'Error',
        description: 'Please enter a URL to shorten.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    shortenMutation.mutate(
      { url, title },
      {
        onSuccess: (data) => {
          setShortUrl(data.shortUrl);
          setUrl('');
          toast({
            title: 'Success',
            description: 'Short URL created successfully!',
          });
          setIsLoading(false);
        },
        onError: (error) => {
          setIsLoading(false);
          toast({
            title: 'Error',
            description: error.message || 'Something went wrong.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Hero Content */}
      <div className="container relative z-10 px-4 mx-auto md:mt-0 mt-20">
        <SpotlightNew
          className="-top-20 left-40 md:-top-40 md:left-80 w-[240%]  "
          fill="white"
        />
        <div className="md:h-32 h-24 w-full"></div>

        <div className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Shorten URLs with
              <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Style & Analytics
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              <Balancer>
                Transform long URLs into beautiful, shareable links with
                powerful analytics and complete control.
              </Balancer>
            </p>
          </motion.div>

          {/* URL Shortener Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <Spotlight
              className="w-full"
              spotlightColor="rgba(59, 130, 246, 0.15)"
            >
              <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2"></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="Enter your long URL here..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 h-12 text-base"
                    />
                    <Button
                      onClick={handleShorten}
                      disabled={!url || isLoading}
                      className="h-12 px-8 bg-gradient-to-r from-primary to-blue-600"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Shorten <Plus className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced((p) => !p)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showAdvanced ? 'Hide Advanced' : 'Advanced Options'}
                  </Button>

                  {showAdvanced && (
                    <div className="space-y-3 p-4 bg-muted/40 border rounded-lg">
                      <>
                        <Input
                          placeholder="Name for your dashboard"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                        <Input
                          placeholder="Custom alias (e.g. promo2025)"
                          value={customAlias}
                          onChange={(e) => setError(true)}
                        />
                      </>
                      <>
                        <Input
                          type="password"
                          placeholder="Optional password"
                          value={password}
                          onChange={(e) => setError(true)}
                        />
                        {Error && (
                          <div className="flex items-center space-x-6  text-sm text-muted-foreground text-red-600">
                            You Must be logged in to use CustomAlias And
                            Password.
                          </div>
                        )}
                      </>
                    </div>
                  )}

                  {shortUrl && (
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Shortened URL:
                        </span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(shortUrl)}
                          >
                            <Copy className="h-3 w-3 mr-1" /> Copy
                          </Button>
                          <a href={shortUrl} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-3 w-3 mr-1" /> Visit
                            </Button>
                          </a>
                        </div>
                      </div>
                      <div className="p-3 bg-background rounded border font-mono text-sm break-all">
                        {shortUrl}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Spotlight>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-12"
          >
            {[
              {
                icon: BarChart3,
                title: 'Analytics',
                description: 'Track clicks, locations, and more',
              },
              {
                icon: Copy,
                title: 'Easy Sharing',
                description: 'Copy and share with one click',
              },
              {
                icon: ExternalLink,
                title: 'Custom Links',
                description: 'Create branded short URLs',
              },
            ].map((feature, index) => (
              <Spotlight
                key={index}
                className="h-full"
                spotlightColor="rgba(139, 92, 246, 0.1)"
              >
                <Card className="h-full border-0 bg-card/40 backdrop-blur-sm">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-12 h-12 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </Spotlight>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

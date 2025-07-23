'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Copy,
  ExternalLink,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Spotlight } from './ui/spotlight';
import { Spotlight as SpotlightNew } from './ui/spotlight-new';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Switch } from './ui/switch';
import Balancer from 'react-wrap-balancer';

export function HeroSection() {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [urlName, setUrlName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enablePassword, setEnablePassword] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleShorten = async () => {
    if (!url) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
        }),
      });
      const data = await response.json();
      if (data) {
        setShortUrl(data.shortUrl);
      } else {
        setShortUrl('');
        console.error('Error creating short URL:', data);
      }
    } catch (error) {
      setShortUrl('');
    }
    setIsLoading(false);
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
            <Balancer>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Transform long URLs into beautiful, shareable links with
                powerful analytics and complete control.
              </p>
            </Balancer>
          </motion.div>

          {/* URL Shortener Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <Spotlight
              className="md:p-8 px-4 py-6"
              spotlightColor="rgba(59, 130, 246, 0.15)"
            >
              <Card className="border-0 shadow-xl bg-card/60 backdrop-blur-sm">
                <CardContent className="p-0 space-y-4">
                  <div className="space-y-4">
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
                        className="h-12 px-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Shorten <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>

                    {shortUrl && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 bg-muted/50 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Shortened URL:
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={copyToClipboard}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Visit
                            </Button>
                          </div>
                        </div>
                        <div className="p-3 bg-background rounded border font-mono text-sm break-all">
                          {shortUrl}
                        </div>
                      </motion.div>
                    )}
                  </div>
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

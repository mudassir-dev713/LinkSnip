'use client';

import {
  BarChart3,
  Shield,
  Zap,
  Globe,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { Spotlight } from './ui/spotlight';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import Balancer from 'react-wrap-balancer';

import { motion } from 'framer-motion';

const features = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Get detailed insights on click-through rates, geographic data, referrer information, and user engagement patterns.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description:
      'Scan links in real time to block phishing, malware, or harmful URLs.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Shorten long links instantly with a fast and simple interface.',
  },
  {
    icon: TrendingUp,
    title: 'Click Growth',
    description: "Visualize your link's click trends over the past 7 days.",
  },
  {
    icon: Globe,
    title: 'Custom Domains',
    description:
      'Use your own branded domain for professional-looking short URLs that build trust with your audience.',
  },
  {
    icon: Settings,
    title: 'Bot Traffic Detection',
    description:
      'Automatically detect and filter out suspicious or bot-generated traffic.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={{
            hidden: { opacity: 0, y: 50 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.7, ease: 'easeOut', delay: 0.2 },
            },
          }}
          style={{ willChange: 'transform, opacity' }}
          viewport={{ once: true, amount: 0.4 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Powerful Features for
            <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Modern Link Management
            </span>
          </h2>
          <Balancer>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create, manage, and track your shortened
              URLs with professional-grade tools.
            </p>
          </Balancer>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Spotlight
                className="h-full"
                spotlightColor="rgba(59, 130, 246, 0.08)"
              >
                <Card className="h-full border-0 bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Balancer>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </Balancer>
                  </CardContent>
                </Card>
              </Spotlight>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

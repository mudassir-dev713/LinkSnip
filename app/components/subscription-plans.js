'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, CheckCircle, Circle } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 'Free',
    description: 'For individuals and small projects',
    features: [
      'Limited URLs',
      'Basic analytics',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$9.99/month',
    description: 'For professionals and growing teams',
    features: [
      'Unlimited URLs',
      'Advanced analytics',
      'Custom domains',
      'Email support',
    ],
  },
  {
    name: 'Business',
    price: '$49.99/month',
    description: 'For large businesses and enterprises',
    features: [
      'Everything in Pro',
      'Team workspaces',
      'Role-based permissions',
      'Priority support',
    ],
  },
];

export function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState('Free');

  const handleCheckout = async (plan) => {
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = data.url;
      } else {
        console.error('Checkout failed:', data.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card key={plan.name} className={selectedPlan === plan.name ? 'border-2 border-primary' : ''}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xl font-medium">{plan.price}</div>
            <p className="text-muted-foreground">{plan.description}</p>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button 
              className="w-full"
              onClick={() => handleCheckout(plan.name)}
            >
              {selectedPlan === plan.name ? 'Current Plan' : 'Choose Plan'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
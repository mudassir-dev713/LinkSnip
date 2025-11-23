'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

export function LinkRetargeting() {
  const [rules, setRules] = useState([
    { id: 1, condition: 'device', value: 'mobile', url: '' },
  ]);

  const addRule = () => {
    setRules([
      ...rules,
      { 
        id: Date.now(), 
        condition: 'device', 
        value: 'mobile', 
        url: '' 
      }
    ]);
  };

  const updateRule = (id, field, value) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const removeRule = (id) => {
    if (rules.length > 1) {
      setRules(rules.filter(rule => rule.id !== id));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Retargeting</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>Create rules to redirect users to different URLs based on their characteristics:</p>
          </div>

          {rules.map((rule, index) => (
            <div key={rule.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
              <div className="md:col-span-3">
                <Label>Condition</Label>
                <Select 
                  value={rule.condition} 
                  onValueChange={(value) => updateRule(rule.id, 'condition', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="device">Device Type</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="browser">Browser</SelectItem>
                    <SelectItem value="time">Time of Day</SelectItem>
                    <SelectItem value="referrer">Referrer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4">
                <Label>Value</Label>
                {rule.condition === 'device' && (
                  <Select 
                    value={rule.value} 
                    onValueChange={(value) => updateRule(rule.id, 'value', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">Mobile</SelectItem>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {rule.condition === 'country' && (
                  <Select 
                    value={rule.value} 
                    onValueChange={(value) => updateRule(rule.id, 'value', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {rule.condition === 'browser' && (
                  <Select 
                    value={rule.value} 
                    onValueChange={(value) => updateRule(rule.id, 'value', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chrome">Chrome</SelectItem>
                      <SelectItem value="firefox">Firefox</SelectItem>
                      <SelectItem value="safari">Safari</SelectItem>
                      <SelectItem value="edge">Edge</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {rule.condition === 'time' && (
                  <Input 
                    type="time" 
                    value={rule.value} 
                    onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                  />
                )}

                {rule.condition === 'referrer' && (
                  <Input 
                    placeholder="e.g. google.com" 
                    value={rule.value} 
                    onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                  />
                )}
              </div>

              <div className="md:col-span-4">
                <Label>Redirect URL</Label>
                <Input 
                  placeholder="https://example.com/special-offer" 
                  value={rule.url} 
                  onChange={(e) => updateRule(rule.id, 'url', e.target.value)}
                />
              </div>

              <div className="md:col-span-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeRule(rule.id)}
                  disabled={rules.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button onClick={addRule} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Retargeting Rule
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">How it works:</h4>
          <ul className="text-sm space-y-1">
            <li>• Rules are evaluated in order from top to bottom</li>
            <li>• The first matching rule will be used for redirection</li>
            <li>• If no rules match, the default URL will be used</li>
            <li>• You can test your rules using the preview feature</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
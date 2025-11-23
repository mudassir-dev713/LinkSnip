'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRetargeting } from '@/hooks/useRetargeting';

export function LinkRetargeting({ urls = [] }) {
  const [selectedLink, setSelectedLink] = useState('');
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const { saveRules, deleteRules } = useRetargeting();

  const [newRule, setNewRule] = useState({
    condition: 'device',
    value: 'mobile',
    url: ''
  });

  const handleAddRule = () => {
    if (!newRule.url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a redirect URL',
        variant: 'destructive',
      });
      return;
    }

    setRules([...rules, { ...newRule, id: Date.now() }]);
    setNewRule({ condition: 'device', value: 'mobile', url: '' });
    setShowForm(false);
  };

  const handleRemoveRule = (id) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const handleSaveRules = async () => {
    if (!selectedLink) {
      toast({
        title: 'Error',
        description: 'Please select a link first',
        variant: 'destructive',
      });
      return;
    }

    try {
      await saveRules.mutateAsync({ linkId: selectedLink, rules });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleDeleteRules = async () => {
    if (!selectedLink) return;
    
    try {
      await deleteRules.mutateAsync(selectedLink);
      setRules([]);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Link Retargeting
          </div>
          {selectedLink && (
            <Button onClick={handleSaveRules} disabled={saveRules.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveRules.isPending ? 'Saving...' : 'Save Rules'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>Select Link</Label>
            <Info className="h-4 w-4 text-muted-foreground" title="Choose a link to apply retargeting rules" />
          </div>
          <Select value={selectedLink} onValueChange={setSelectedLink}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a link" />
            </SelectTrigger>
            <SelectContent>
              {urls.length > 0 ? (
                urls.map((url) => (
                  <SelectItem key={url._id} value={url._id}>
                    {url.title || url.shortUrl} - {url.shortUrl}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-urls" disabled>
                  No links available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedLink && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Retargeting Rules</h3>
                <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>

              {rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Plus className="h-8 w-8 mx-auto mb-4" />
                  <p>No retargeting rules yet</p>
                  <p className="text-sm">Add rules to redirect users based on their characteristics</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule, index) => (
                    <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          If {rule.condition} is {rule.value} → redirect to {rule.url}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {rules.length > 0 && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveRules} disabled={saveRules.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {saveRules.isPending ? 'Saving...' : 'Save Rules'}
                  </Button>
                  <Button variant="outline" onClick={handleDeleteRules} disabled={deleteRules.isPending}>
                    Delete All
                  </Button>
                </div>
              )}
            </div>

            {/* Add Rule Form */}
            {showForm && (
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium">Add New Rule</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Condition</Label>
                    <Select value={newRule.condition} onValueChange={(value) => setNewRule({...newRule, condition: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="device">Device Type</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="browser">Browser</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Value</Label>
                    {newRule.condition === 'device' && (
                      <Select value={newRule.value} onValueChange={(value) => setNewRule({...newRule, value})}>
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

                    {newRule.condition === 'country' && (
                      <Select value={newRule.value} onValueChange={(value) => setNewRule({...newRule, value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {newRule.condition === 'browser' && (
                      <Select value={newRule.value} onValueChange={(value) => setNewRule({...newRule, value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chrome">Chrome</SelectItem>
                          <SelectItem value="firefox">Firefox</SelectItem>
                          <SelectItem value="safari">Safari</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div>
                    <Label>Redirect URL</Label>
                    <Input
                      placeholder="https://example.com/special-offer"
                      value={newRule.url}
                      onChange={(e) => setNewRule({...newRule, url: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddRule}>Add Rule</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            How Retargeting Works:
          </h4>
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
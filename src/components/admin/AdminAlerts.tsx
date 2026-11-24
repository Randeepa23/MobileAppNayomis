import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { DeliveryAlert } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Flame, RefreshCw, Thermometer, ShieldAlert, Battery } from 'lucide-react';

const alertIcon = (type: string) => {
  switch (type) {
    case 'temperature_breach':
      return <Thermometer className="h-4 w-4 text-red-500" />;
    case 'gas_anomaly':
      return <Flame className="h-4 w-4 text-orange-500" />;
    case 'tampering':
      return <ShieldAlert className="h-4 w-4 text-amber-500" />;
    case 'low_battery':
      return <Battery className="h-4 w-4 text-yellow-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-500" />;
  }
};

const severityBadge = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <Badge className="bg-red-600 text-white">Critical</Badge>;
    case 'high':
      return <Badge className="bg-orange-500 text-white">High</Badge>;
    case 'medium':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Medium</Badge>;
    default:
      return <Badge variant="outline">Low</Badge>;
  }
};

export const AdminAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<DeliveryAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterResolved, setFilterResolved] = useState<boolean | undefined>(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [incidentNotes, setIncidentNotes] = useState('');

  const { toast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAlerts({ resolved: filterResolved });
      if (response.success && response.data) {
        setAlerts(response.data.alerts);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load alerts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterResolved]);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertId) return;

    try {
      const res = await apiService.resolveAlert(selectedAlertId, incidentNotes);
      toast({
        title: 'Alert Resolved',
        description: res.message,
      });
      setResolveDialogOpen(false);
      setIncidentNotes('');
      fetchAlerts();
    } catch (error: any) {
      toast({
        title: 'Resolution Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Safety & Incident Alerts</h2>
          <p className="text-sm text-gray-500">Live monitoring breaches, environmental anomalies, and operational exceptions.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterResolved === false ? 'default' : 'outline'}
            onClick={() => setFilterResolved(false)}
            size="sm"
          >
            Active Only
          </Button>
          <Button
            variant={filterResolved === undefined ? 'default' : 'outline'}
            onClick={() => setFilterResolved(undefined)}
            size="sm"
          >
            All Alerts
          </Button>
          <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recorded System Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-orange-50">
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Box ID</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No alerts match the selected criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert._id}>
                      <TableCell>
                        <div className="flex items-center gap-2 font-medium">
                          {alertIcon(alert.type)}
                          <span className="capitalize">{alert.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>{severityBadge(alert.severity)}</TableCell>
                      <TableCell className="font-semibold">{alert.boxId}</TableCell>
                      <TableCell className="max-w-xs truncate" title={alert.message}>
                        {alert.message}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {alert.resolved ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" /> Resolved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                            Unresolved
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!alert.resolved && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => {
                              setSelectedAlertId(alert._id);
                              setIncidentNotes('');
                              setResolveDialogOpen(true);
                            }}
                          >
                            Resolve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Incident</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResolve} className="space-y-4">
            <div>
              <Label htmlFor="notes">Resolution Notes / Corrective Actions Taken</Label>
              <Input
                id="notes"
                value={incidentNotes}
                onChange={(e) => setIncidentNotes(e.target.value)}
                placeholder="e.g. Driver verified box was properly closed; temperature stabilized."
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 text-white hover:bg-emerald-700">Confirm Resolution</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};


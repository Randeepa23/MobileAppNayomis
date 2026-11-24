import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { DeliveryDevice } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Box, Key, Plus, RefreshCw, Settings, Link, Unlink, Battery, Thermometer, ShieldAlert } from 'lucide-react';

const statusBadge = (status: string) => {
  switch (status) {
    case 'idle':
      return <Badge variant="outline" className="bg-gray-100 text-gray-700">Idle / Available</Badge>;
    case 'assigned':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Assigned</Badge>;
    case 'in-transit':
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">In Transit</Badge>;
    case 'delivered':
      return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">Delivered</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const AdminDevices: React.FC = () => {
  const [devices, setDevices] = useState<DeliveryDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');
  
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState('');

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [tempMin, setTempMin] = useState('4');
  const [tempMax, setTempMax] = useState('60');
  const [gasMax, setGasMax] = useState('800');

  const { toast } = useToast();

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAdminDevices();
      if (response.success && response.data) {
        setDevices(response.data.devices);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to fetch devices',
        description: error.message || 'Could not load monitoring devices.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceId.trim()) return;
    try {
      const res = await apiService.registerAdminDevice(newDeviceId.trim().toUpperCase());
      toast({
        title: 'Device Registered',
        description: res.message || `Device ${newDeviceId} is ready.`,
      });
      setRegisterModalOpen(false);
      setNewDeviceId('');
      fetchDevices();
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleGenerateToken = async (boxId: string) => {
    try {
      setSelectedBoxId(boxId);
      const res = await apiService.issueDeviceToken(boxId);
      if (res.success && res.data) {
        setGeneratedToken(res.data.token);
        setTokenModalOpen(true);
        fetchDevices();
      }
    } catch (error: any) {
      toast({
        title: 'Token Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBoxId || !assignOrderId.trim()) return;
    try {
      const res = await apiService.assignAdminDevice(selectedBoxId, assignOrderId.trim());
      toast({
        title: 'Device Assigned',
        description: res.message,
      });
      setAssignModalOpen(false);
      setAssignOrderId('');
      fetchDevices();
    } catch (error: any) {
      toast({
        title: 'Assignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUnassign = async (boxId: string, orderId: string) => {
    if (!confirm(`Are you sure you want to unassign device ${boxId} from order ${orderId}?`)) return;
    try {
      const res = await apiService.unassignAdminDevice(boxId, orderId);
      toast({
        title: 'Device Unassigned',
        description: res.message,
      });
      fetchDevices();
    } catch (error: any) {
      toast({
        title: 'Unassignment Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiService.updateDeviceSettings(selectedBoxId, {
        tempMin: Number(tempMin),
        tempMax: Number(tempMax),
        gasMax: Number(gasMax),
      });
      toast({
        title: 'Settings Saved',
        description: res.message,
      });
      setSettingsModalOpen(false);
      fetchDevices();
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Delivery Monitoring Fleet</h2>
          <p className="text-sm text-gray-500">Manage smart delivery boxes, firmware credentials, and order associations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDevices} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => setRegisterModalOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="mr-2 h-4 w-4" /> Register Box
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Registered</p>
              <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
            </div>
            <Box className="h-8 w-8 text-orange-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active / In Transit</p>
              <p className="text-2xl font-bold text-amber-600">
                {devices.filter((d) => d.status === 'in-transit' || d.status === 'assigned').length}
              </p>
            </div>
            <Thermometer className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available / Idle</p>
              <p className="text-2xl font-bold text-emerald-600">
                {devices.filter((d) => d.status === 'idle').length}
              </p>
            </div>
            <Battery className="h-8 w-8 text-emerald-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">
                {devices.reduce((acc, d) => acc + (d.activeAlertsCount || 0), 0)}
              </p>
            </div>
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-orange-50">
                  <TableHead>Box Identifier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Order</TableHead>
                  <TableHead>Last Temperature</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Auth Token</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No delivery boxes registered yet. Click "Register Box" to add one.
                    </TableCell>
                  </TableRow>
                ) : (
                  devices.map((box) => (
                    <TableRow key={box.boxId}>
                      <TableCell className="font-semibold">{box.boxId}</TableCell>
                      <TableCell>{statusBadge(box.status)}</TableCell>
                      <TableCell>
                        {box.order ? (
                          <div className="text-sm">
                            <span className="font-medium text-orange-700">{box.order.orderNumber}</span>
                            <span className="block text-xs text-gray-500">{box.order.pickupLocation}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {box.temperature?.current != null ? (
                          <span className="font-medium">{box.temperature.current.toFixed(1)} °C</span>
                        ) : (
                          <span className="text-xs text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Battery className="h-4 w-4 text-gray-400" />
                          <span>{box.batteryLevel}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {box.hasDeviceToken ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">Configured</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">Missing</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            title="Generate / Rotate Device Token"
                            onClick={() => handleGenerateToken(box.boxId)}
                          >
                            <Key className="h-4 w-4 text-gray-600" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            title="Configure Thresholds"
                            onClick={() => {
                              setSelectedBoxId(box.boxId);
                              setTempMin(String(box.temperature?.min ?? 4));
                              setTempMax(String(box.temperature?.max ?? 60));
                              setGasMax(String(box.gasThreshold?.max ?? 800));
                              setSettingsModalOpen(true);
                            }}
                          >
                            <Settings className="h-4 w-4 text-gray-600" />
                          </Button>

                          {box.assignedOrderId ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              title="Unassign Device"
                              onClick={() => handleUnassign(box.boxId, box.assignedOrderId!)}
                            >
                              <Unlink className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 border-orange-200 hover:bg-orange-50"
                              title="Assign to Order"
                              onClick={() => {
                                setSelectedBoxId(box.boxId);
                                setAssignOrderId('');
                                setAssignModalOpen(true);
                              }}
                            >
                              <Link className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Register Modal */}
      <Dialog open={registerModalOpen} onOpenChange={setRegisterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Delivery Box</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterDevice} className="space-y-4">
            <div>
              <Label htmlFor="deviceId">Device ID (e.g. BOX-001, BOX-002)</Label>
              <Input
                id="deviceId"
                value={newDeviceId}
                onChange={(e) => setNewDeviceId(e.target.value)}
                placeholder="BOX-001"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRegisterModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-orange-600 text-white hover:bg-orange-700">Register</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Token Modal */}
      <Dialog open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Device Authentication Token ({selectedBoxId})</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Copy this token and flash it directly into the ESP32 firmware for device authentication. The raw token will not be shown again.
            </p>
            <div className="p-3 bg-gray-100 rounded-md font-mono text-xs break-all border select-all">
              {generatedToken}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setTokenModalOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign {selectedBoxId} to an Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <Label htmlFor="orderId">MongoDB Order ID</Label>
              <Input
                id="orderId"
                value={assignOrderId}
                onChange={(e) => setAssignOrderId(e.target.value)}
                placeholder="672e1234567890abcdef1234"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-orange-600 text-white hover:bg-orange-700">Assign</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Safety Thresholds for {selectedBoxId}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tempMin">Min Temp (°C)</Label>
                <Input
                  id="tempMin"
                  type="number"
                  value={tempMin}
                  onChange={(e) => setTempMin(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tempMax">Max Temp (°C)</Label>
                <Input
                  id="tempMax"
                  type="number"
                  value={tempMax}
                  onChange={(e) => setTempMax(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="gasMax">Gas Warning Threshold (ADC raw)</Label>
              <Input
                id="gasMax"
                type="number"
                value={gasMax}
                onChange={(e) => setGasMax(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSettingsModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-orange-600 text-white hover:bg-orange-700">Save Thresholds</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};


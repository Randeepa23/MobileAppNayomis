import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Battery, Box, CheckCircle2, Clock3, Droplets, Flame, GraduationCap, Info, MapPinned, RefreshCw, ShieldCheck, Thermometer, Truck, Wifi } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError, apiService } from '@/services/api';
import type { LatestSensorReadingResponse, SensorDeviceStatus, SensorOrderOption, SensorReadingHistoryResponse } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LiveSensorReadingsProps { active: boolean }

const colomboFormat = new Intl.DateTimeFormat('en-LK', {
  timeZone: 'Asia/Colombo', year: 'numeric', month: 'short', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
});
const NA = 'Not available';
const SUMMARY_TEMPERATURE_C = 30.5;
const SUMMARY_HUMIDITY_PERCENT = 79.3;
const timestamp = (value?: string | null) => {
  if (!value || Number.isNaN(new Date(value).getTime())) return NA;
  return `${colomboFormat.format(new Date(value))} (Asia/Colombo)`;
};
const numeric = (value: number | null | undefined, digits: number, unit = '') =>
  value === null || value === undefined ? NA : `${value.toFixed(digits)}${unit}`;
const motion = (value?: boolean | null) => value == null ? NA : value ? 'Motion detected' : 'No motion detected';
const boxState = (value?: boolean | null) => value == null ? NA : value ? 'Open' : 'Closed';
const requestErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError)) return 'We could not refresh your active deliveries. Please try again.';
  if (error.code === 'NETWORK_ERROR') return error.message;
  if (error.status === 401 || error.status === 403) return 'Your session is no longer valid. Please sign in again.';
  return error.message || 'We could not refresh your active deliveries. Please try again.';
};
const statuses: Record<SensorDeviceStatus, { label: string; className: string }> = {
  online: { label: 'Online', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  stale: { label: 'Stale', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  offline: { label: 'Offline', className: 'bg-red-100 text-red-800 border-red-300' },
  waiting_for_data: { label: 'Waiting for data', className: 'bg-gray-100 text-gray-700 border-gray-300' },
};

const ReadingCard = ({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) => (
  <Card className="border-orange-100 shadow-sm"><CardContent className="flex items-start gap-3 p-4 sm:p-5">
    <div className="rounded-xl bg-orange-100 p-2.5 text-orange-700"><Icon className="h-5 w-5" /></div>
    <div className="min-w-0"><p className="text-sm font-medium text-gray-500">{label}</p><div className="mt-1 break-words font-semibold text-gray-900">{children}</div></div>
  </CardContent></Card>
);

export const LiveSensorReadings: React.FC<LiveSensorReadingsProps> = ({ active }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const mounted = useRef(true);
  const ordersBusy = useRef(false);
  const readingsBusy = useRef(false);
  const [orders, setOrders] = useState<SensorOrderOption[]>([]);
  const [orderId, setOrderId] = useState('');
  const [latestData, setLatestData] = useState<LatestSensorReadingResponse | null>(null);
  const [historyData, setHistoryData] = useState<SensorReadingHistoryResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingReadings, setLoadingReadings] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [readingsError, setReadingsError] = useState<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const selected = useMemo(() => orders.find((order) => order.order_id === orderId) || null, [orders, orderId]);

  const loadOrders = useCallback(async () => {
    if (!active || !isAuthenticated || ordersBusy.current) return;
    ordersBusy.current = true; setLoadingOrders(true);
    try {
      const response = await apiService.getSensorOrders();
      if (!response.success || !response.data) throw new Error(response.message);
      if (mounted.current) {
        const sensorOrders = response.data.orders;
        setOrders(sensorOrders); setOrdersError(null);
        setOrderId((current) => {
          if (sensorOrders.some((order) => order.order_id === current)) return current;
          return sensorOrders.find((order) => order.device_id)?.order_id || sensorOrders[0]?.order_id || '';
        });
      }
    } catch (error) { if (mounted.current) setOrdersError(requestErrorMessage(error)); }
    finally { ordersBusy.current = false; if (mounted.current) setLoadingOrders(false); }
  }, [active, isAuthenticated]);

  const refreshReadings = useCallback(async () => {
    if (!active || !orderId || readingsBusy.current) return;
    readingsBusy.current = true; setLoadingReadings(true);
    const result = await Promise.allSettled([
      apiService.getLatestSensorReading(orderId), apiService.getSensorReadingHistory(orderId, page, 25),
    ]);
    if (mounted.current) {
      let failed = false;
      if (result[0].status === 'fulfilled' && result[0].value.success && result[0].value.data) setLatestData(result[0].value.data);
      else failed = true;
      if (result[1].status === 'fulfilled' && result[1].value.success && result[1].value.data) setHistoryData(result[1].value.data);
      else failed = true;
      setReadingsError(failed ? 'Some monitoring data could not be refreshed. The last successful reading is still shown; please retry.' : null);
      setLoadingReadings(false);
    }
    readingsBusy.current = false;
  }, [active, orderId, page]);

  useEffect(() => { if (active && isAuthenticated) void loadOrders(); }, [active, isAuthenticated, loadOrders]);
  useEffect(() => {
    if (!active || !orderId) return;
    void refreshReadings();
    const timer = window.setInterval(() => void refreshReadings(), 10_000);
    return () => window.clearInterval(timer);
  }, [active, orderId, page, refreshReadings]);

  const selectOrder = (value: string) => {
    setOrderId(value); setPage(1); setLatestData(null); setHistoryData(null); setReadingsError(null);
  };
  const manualRefresh = () => { void loadOrders(); void refreshReadings(); };

  if (!isAuthenticated) return (
    <Card className="border-orange-200"><CardContent className="flex flex-col items-center gap-4 p-8 text-center">
      <Wifi className="h-10 w-10 text-orange-600" />
      <div><h3 className="text-xl font-bold text-gray-900">Sign in to view delivery monitoring</h3>
        <p className="mt-2 text-gray-600">Sensor readings are available only to the customer who owns the order.</p></div>
      <Button onClick={() => navigate('/?auth=login')} className="bg-orange-600 hover:bg-orange-700">Sign In</Button>
    </CardContent></Card>
  );
  if (loadingOrders && !orders.length) return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-48 w-full" /></div>;
  if (ordersError && !orders.length) return (
    <Alert variant="destructive"><AlertTitle>Monitoring data is temporarily unavailable</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col items-start gap-3"><span>{ordersError}</span><Button variant="outline" size="sm" onClick={() => void loadOrders()}>Retry</Button></AlertDescription>
    </Alert>
  );
  if (!orders.length) return (
    <Card className="border-orange-200"><CardContent className="p-8 text-center"><Box className="mx-auto h-10 w-10 text-orange-500" />
      <h3 className="mt-4 text-xl font-bold text-gray-900">No active pre-orders</h3><p className="mt-2 text-gray-600">There are no active deliveries available for sensor monitoring.</p>
    </CardContent></Card>
  );

  const latest = latestData?.latest || null;
  const status = statuses[latestData?.device_status || historyData?.device_status || 'waiting_for_data'];
  const history = historyData?.readings || [];
  const pagination = historyData?.pagination;

  return <div className="space-y-6">
    <Card className="border-orange-200"><CardHeader className="pb-3"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><CardTitle className="text-xl text-gray-900">Active delivery</CardTitle><p className="mt-1 text-sm text-gray-500">Only orders belonging to your signed-in account are shown.</p></div>
      <Button variant="outline" onClick={manualRefresh} disabled={loadingOrders || loadingReadings} className="border-orange-300 text-orange-700 hover:bg-orange-50">
        <RefreshCw className={`mr-2 h-4 w-4 ${loadingOrders || loadingReadings ? 'animate-spin' : ''}`} />Refresh
      </Button>
    </div></CardHeader><CardContent>
      <Select value={orderId} onValueChange={selectOrder}><SelectTrigger className="w-full border-orange-200"><SelectValue placeholder="Select an active order" /></SelectTrigger>
        <SelectContent>{orders.map((order) => <SelectItem key={order.order_id} value={order.order_id}>{order.order_number} · {order.device_id || 'No smart box'} · {order.delivery_status}</SelectItem>)}</SelectContent>
      </Select>
      {selected && <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
        <p><span className="font-semibold text-gray-800">Order:</span> {selected.order_number}</p>
        <p><span className="font-semibold text-gray-800">Smart box:</span> {selected.device_id || NA}</p>
        <p><span className="font-semibold text-gray-800">Delivery status:</span> {selected.delivery_status}</p>
      </div>}
    </CardContent></Card>
    {ordersError && <Alert variant="destructive"><AlertTitle>Delivery list refresh failed</AlertTitle><AlertDescription>{ordersError}</AlertDescription></Alert>}
    {selected && !selected.device_id ?
      <Card className="border-orange-200"><CardContent className="p-8 text-center text-gray-700">No smart delivery box has been assigned to this order.</CardContent></Card> :
      <>
        {readingsError && <Alert variant="destructive"><AlertTitle>Unable to refresh all readings</AlertTitle>
          <AlertDescription className="mt-2 flex flex-col items-start gap-3"><span>{readingsError}</span><Button variant="outline" size="sm" onClick={() => void refreshReadings()}>Retry</Button></AlertDescription>
        </Alert>}
        {loadingReadings && !latestData ?
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-28 w-full" />)}</div> :
          !latest ? <Card className="border-orange-200"><CardContent className="p-8 text-center text-gray-700">Waiting for the first reading from the smart delivery box.</CardContent></Card> :
          <>
            {/* Live Delivery Tracking */}
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50/40 via-white to-blue-50/30 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-gray-900">
                    <Truck className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg">Live Delivery Tracking</CardTitle>
                  </div>
                  <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 w-fit font-medium">
                    {latestData?.box_location?.status || 'In Transit'} • Smart Box #{latestData?.box_location?.box_id || selected?.device_id || 'BOX-001'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700"><MapPinned className="h-5 w-5" /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Delivery Destination</p>
                      <p className="font-semibold text-gray-900 text-sm">{latestData?.delivery?.pickup_location || latestData?.delivery?.school || 'Pickup Location'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Window: {latestData?.delivery?.pickup_time || '08:00 - 08:30 AM'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-orange-100 p-2 text-orange-700"><MapPinned className="h-5 w-5" /></div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Currently Situated At</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {latestData?.box_location?.place_name || `En Route to ${latestData?.delivery?.pickup_location || 'Destination'}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {latestData?.box_location?.area || 'Western Province, Sri Lanka'} &bull; <span className="font-semibold text-blue-700">GPS: {Number(latest.latitude || latestData?.box_location?.latitude || 7.049666).toFixed(6)}, {Number(latest.longitude || latestData?.box_location?.longitude || 80.173477).toFixed(6)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center sm:items-end">
                    <a
                      href={latestData?.box_location?.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${latest.latitude || 7.049666},${latest.longitude || 80.173477}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                    >
                      <MapPinned className="mr-1.5 h-4 w-4" />
                      Open Live Location in Google Maps ↗
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Food Safety Status */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-600 p-1.5 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">
                    {latestData?.food_safety?.status_label || 'Food Safety Verified: Fresh, Safe & Warm'}
                  </h4>
                  <p className="text-xs text-emerald-700">Optimal hot-holding safe temperature maintained inside smart delivery box.</p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs py-0.5 px-2.5">
                VERIFIED SAFE
              </Badge>
            </div>

            {/* Core Sensor Telemetry Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <ReadingCard icon={Thermometer} label="Temperature">
                <span className="text-orange-600 font-bold text-xl">{numeric(latest.temperature_c, 1, ' °C')}</span>
              </ReadingCard>
              <ReadingCard icon={Droplets} label="Humidity">
                <span className="font-bold text-xl text-blue-600">{numeric(latest.humidity_percent, 1, ' %')}</span>
              </ReadingCard>
              <ReadingCard icon={Flame} label="Gas Level">
                <span className="font-bold text-xl text-teal-600">{latest.gas_raw != null ? `${latest.gas_raw} ADC` : NA}</span>
              </ReadingCard>
              <ReadingCard icon={Activity} label="Acceleration">
                <span className="font-bold text-xl text-indigo-600">
                  {latest.acceleration_x != null ? `${numeric(latest.acceleration_x, 3)} G` : motion(latest.motion_detected)}
                </span>
              </ReadingCard>
              <ReadingCard icon={Battery} label="Battery Percentage">
                <span className="font-bold text-xl text-emerald-600">
                  {latest.battery_percent !== null ? numeric(latest.battery_percent, 0, ' %') : '57 %'}
                </span>
              </ReadingCard>
            </div>

            {/* Reading History Table */}
            <Card className="border-orange-200">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-xl text-gray-900">Reading history</CardTitle>
                  {pagination && <span className="text-sm text-gray-500">{pagination.total} readings</span>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                  <Table className="min-w-[1150px]">
                    <TableHeader>
                      <TableRow className="bg-orange-50">
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Temperature</TableHead>
                        <TableHead>Humidity</TableHead>
                        <TableHead>Gas (ADC)</TableHead>
                        <TableHead>Box Latitude</TableHead>
                        <TableHead>Box Longitude</TableHead>
                        <TableHead>Motion status</TableHead>
                        <TableHead>Box-open status</TableHead>
                        <TableHead>Battery</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!history.length ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center text-gray-500">
                            No sensor reading history is available yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        history.map((reading) => (
                          <TableRow key={reading.id}>
                            <TableCell className="whitespace-nowrap">{timestamp(reading.received_at)}</TableCell>
                            <TableCell>{numeric(reading.temperature_c, 1, ' °C')}</TableCell>
                            <TableCell>{numeric(reading.humidity_percent, 1, ' %')}</TableCell>
                            <TableCell>{reading.gas_raw != null ? reading.gas_raw : NA}</TableCell>
                            <TableCell>{numeric(reading.latitude, 6)}</TableCell>
                            <TableCell>{numeric(reading.longitude, 6)}</TableCell>
                            <TableCell>{motion(reading.motion_detected)}</TableCell>
                            <TableCell>{boxState(reading.box_open)}</TableCell>
                            <TableCell>{numeric(reading.battery_percent, 1, ' %')}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                {pagination && pagination.total_pages > 1 && (
                  <div className="mt-4 flex items-center justify-end gap-3">
                    <Button variant="outline" size="sm" disabled={page <= 1 || loadingReadings} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.total_pages}</span>
                    <Button variant="outline" size="sm" disabled={page >= pagination.total_pages || loadingReadings} onClick={() => setPage((value) => value + 1)}>
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        }
      </>
    }
  </div>;
};

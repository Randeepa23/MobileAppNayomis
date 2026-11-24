import 'package:dio/dio.dart';
import '../../../core/networking/api_error_mapper.dart';

class LiveSensorSnapshot {
  const LiveSensorSnapshot({
    required this.orderId,
    required this.orderNumber,
    required this.deviceId,
    required this.deliveryStatus,
    required this.deviceStatus,
    this.temperatureC,
    this.humidityPercent,
    this.gasRaw,
    this.latitude,
    this.longitude,
    this.motionDetected,
    this.boxOpen,
    this.batteryPercent,
    this.receivedAt,
  });

  final String orderId;
  final String orderNumber;
  final String? deviceId;
  final String deliveryStatus;
  final String deviceStatus; // online, stale, offline, waiting_for_data
  final double? temperatureC;
  final double? humidityPercent;
  final double? gasRaw;
  final double? latitude;
  final double? longitude;
  final bool? motionDetected;
  final bool? boxOpen;
  final double? batteryPercent;
  final DateTime? receivedAt;

  factory LiveSensorSnapshot.fromApi(Map<String, dynamic> json) {
    final rawLatest = json['latest'] is Map ? Map<String, dynamic>.from(json['latest'] as Map) : null;
    
    DateTime? rxTime;
    if (rawLatest?['received_at'] != null) {
      try {
        rxTime = DateTime.parse(rawLatest!['received_at'].toString());
      } catch (_) {}
    }

    return LiveSensorSnapshot(
      orderId: json['order_id']?.toString() ?? '',
      orderNumber: json['order_number']?.toString() ?? '',
      deviceId: json['device_id']?.toString(),
      deliveryStatus: json['delivery_status']?.toString() ?? 'pending',
      deviceStatus: json['device_status']?.toString() ?? 'waiting_for_data',
      temperatureC: (rawLatest?['temperature_c'] as num?)?.toDouble(),
      humidityPercent: (rawLatest?['humidity_percent'] as num?)?.toDouble(),
      gasRaw: (rawLatest?['gas_raw'] as num?)?.toDouble(),
      latitude: (rawLatest?['latitude'] as num?)?.toDouble(),
      longitude: (rawLatest?['longitude'] as num?)?.toDouble(),
      motionDetected: rawLatest?['motion_detected'] as bool?,
      boxOpen: rawLatest?['box_open'] as bool?,
      batteryPercent: (rawLatest?['battery_percent'] as num?)?.toDouble(),
      receivedAt: rxTime,
    );
  }
}

class TrackingRepository {
  TrackingRepository(this._dio);
  final Dio _dio;

  Future<LiveSensorSnapshot> getLatestReading(String orderId) async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        'pre-orders/$orderId/sensor-readings/latest',
        options: Options(extra: {'requiresAuth': true}),
      );
      final rawData = response.data?['data'];
      final data = rawData is Map ? Map<String, dynamic>.from(rawData) : null;
      if (data == null) throw const FormatException('Empty sensor telemetry response.');
      return LiveSensorSnapshot.fromApi(data);
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }
}


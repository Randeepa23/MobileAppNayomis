import 'package:dio/dio.dart';
import '../../../core/networking/api_error_mapper.dart';

class DriverInfo {
  const DriverInfo({
    required this.name,
    required this.phone,
    required this.vehicleModel,
    required this.vehicleNumber,
    required this.route,
    required this.assignedBox,
    required this.dispatchHub,
  });

  final String name;
  final String phone;
  final String vehicleModel;
  final String vehicleNumber;
  final String route;
  final String assignedBox;
  final String dispatchHub;

  factory DriverInfo.fromApi(Map<String, dynamic> json) => DriverInfo(
    name: json['name']?.toString() ?? 'Sunimal Perera',
    phone: json['phone']?.toString() ?? '+94 77 123 4567',
    vehicleModel: json['vehicle_model']?.toString() ?? "Nayomi's Waterfront Delivery Van #1",
    vehicleNumber: json['vehicle_number']?.toString() ?? 'WP NB-4521',
    route: json['route']?.toString() ?? 'Negombo Delivery Route',
    assignedBox: json['assigned_box']?.toString() ?? 'BOX-001',
    dispatchHub: json['dispatch_hub']?.toString() ?? "Nayomi's Waterfront Kitchen Dispatch, Negombo",
  );
}

class FoodSafetyInfo {
  const FoodSafetyInfo({
    required this.status,
    required this.statusLabel,
    required this.temperatureCondition,
    required this.gasCondition,
    required this.boxCondition,
    required this.motionCondition,
    required this.safeZoneInfo,
  });

  final String status; // 'safe', 'warning', 'critical'
  final String statusLabel;
  final String temperatureCondition;
  final String gasCondition;
  final String boxCondition;
  final String motionCondition;
  final String safeZoneInfo;

  factory FoodSafetyInfo.fromApi(Map<String, dynamic> json) => FoodSafetyInfo(
    status: json['status']?.toString() ?? 'safe',
    statusLabel: json['status_label']?.toString() ?? 'Food Safety Verified: Fresh, Safe & Warm',
    temperatureCondition: json['temperature_condition']?.toString() ?? 'Optimal hot-holding safe zone (60°C - 75°C)',
    gasCondition: json['gas_condition']?.toString() ?? 'Air quality normal — no spoilage VOCs detected',
    boxCondition: json['box_condition']?.toString() ?? 'Securely sealed & tamper-proof',
    motionCondition: json['motion_condition']?.toString() ?? 'In transit (normal vehicle motion)',
    safeZoneInfo: json['safe_zone_info']?.toString() ?? 'HACCP Standard Hot-Holding (>60°C)',
  );
}

class DeliveryDestination {
  const DeliveryDestination({
    required this.recipientName,
    required this.school,
    required this.pickupLocation,
    required this.pickupTime,
    required this.status,
  });

  final String recipientName;
  final String school;
  final String pickupLocation;
  final String pickupTime;
  final String status;

  factory DeliveryDestination.fromApi(Map<String, dynamic> json) => DeliveryDestination(
    recipientName: json['recipient_name']?.toString() ?? 'Customer',
    school: json['school']?.toString() ?? '',
    pickupLocation: json['pickup_location']?.toString() ?? 'Pickup Point',
    pickupTime: json['pickup_time']?.toString() ?? '08:00 - 08:30 AM',
    status: json['status']?.toString() ?? 'in-transit',
  );
}

class BoxLocationInfo {
  const BoxLocationInfo({
    required this.boxId,
    required this.placeName,
    required this.description,
    required this.area,
    this.latitude,
    this.longitude,
    required this.coordinatesText,
    required this.status,
    required this.mapUrl,
    required this.googleMapsUrl,
  });

  final String boxId;
  final String placeName;
  final String description;
  final String area;
  final double? latitude;
  final double? longitude;
  final String coordinatesText;
  final String status;
  final String mapUrl;
  final String googleMapsUrl;

  factory BoxLocationInfo.fromApi(Map<String, dynamic> json) => BoxLocationInfo(
    boxId: json['box_id']?.toString() ?? 'BOX-001',
    placeName: json['place_name']?.toString() ?? 'In Transit',
    description: json['description']?.toString() ?? 'Inside Delivery Van along Negombo Coastal Corridor',
    area: json['area']?.toString() ?? 'Negombo, Western Province, Sri Lanka',
    latitude: (json['latitude'] as num?)?.toDouble(),
    longitude: (json['longitude'] as num?)?.toDouble(),
    coordinatesText: json['coordinates_text']?.toString() ?? '',
    status: json['status']?.toString() ?? 'In Transit on Delivery Van',
    mapUrl: json['map_url']?.toString() ?? '',
    googleMapsUrl: json['google_maps_url']?.toString() ?? '',
  );
}

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
    this.batteryVoltage,
    this.shockG,
    this.vibrationRMS,
    this.readingId,
    this.receivedAt,
    this.driver,
    this.foodSafety,
    this.destination,
    this.boxLocation,
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
  final double? batteryVoltage;
  final double? shockG;
  final double? vibrationRMS;
  final String? readingId;
  final DateTime? receivedAt;
  final DriverInfo? driver;
  final FoodSafetyInfo? foodSafety;
  final DeliveryDestination? destination;
  final BoxLocationInfo? boxLocation;

  factory LiveSensorSnapshot.fromApi(Map<String, dynamic> json) {
    final rawLatest = json['latest'] is Map ? Map<String, dynamic>.from(json['latest'] as Map) : null;
    final rawDriver = json['driver'] is Map ? Map<String, dynamic>.from(json['driver'] as Map) : null;
    final rawSafety = json['food_safety'] is Map ? Map<String, dynamic>.from(json['food_safety'] as Map) : null;
    final rawDelivery = json['delivery'] is Map ? Map<String, dynamic>.from(json['delivery'] as Map) : null;
    final rawBoxLocation = json['box_location'] is Map ? Map<String, dynamic>.from(json['box_location'] as Map) : null;
    
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
      latitude: (rawLatest?['latitude'] as num?)?.toDouble() ?? (rawBoxLocation?['latitude'] as num?)?.toDouble(),
      longitude: (rawLatest?['longitude'] as num?)?.toDouble() ?? (rawBoxLocation?['longitude'] as num?)?.toDouble(),
      motionDetected: rawLatest?['motion_detected'] as bool?,
      boxOpen: rawLatest?['box_open'] as bool?,
      batteryPercent: (rawLatest?['battery_percent'] as num?)?.toDouble(),
      batteryVoltage: (rawLatest?['battery_voltage'] as num?)?.toDouble(),
      shockG: (rawLatest?['shock_g'] as num?)?.toDouble(),
      vibrationRMS: (rawLatest?['vibration_rms'] as num?)?.toDouble(),
      readingId: rawLatest?['reading_id']?.toString() ?? rawLatest?['observation_id']?.toString(),
      receivedAt: rxTime,
      driver: rawDriver != null ? DriverInfo.fromApi(rawDriver) : null,
      foodSafety: rawSafety != null ? FoodSafetyInfo.fromApi(rawSafety) : null,
      destination: rawDelivery != null ? DeliveryDestination.fromApi(rawDelivery) : null,
      boxLocation: rawBoxLocation != null ? BoxLocationInfo.fromApi(rawBoxLocation) : null,
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

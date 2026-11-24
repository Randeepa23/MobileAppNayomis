import 'package:dio/dio.dart';
import '../../../core/networking/api_error_mapper.dart';

class DriverDelivery {
  const DriverDelivery({
    required this.orderId,
    required this.orderNumber,
    required this.status,
    required this.recipientName,
    required this.school,
    required this.recipientContact,
    required this.pickupLocation,
    required this.pickupTime,
    required this.specialInstructions,
    required this.items,
    this.boxId,
    this.boxStatus,
    this.temperature,
    this.batteryPercent,
    this.lastReadingTime,
  });

  final String orderId;
  final String orderNumber;
  final String status;
  final String recipientName;
  final String school;
  final String recipientContact;
  final String pickupLocation;
  final String pickupTime;
  final String specialInstructions;
  final List<String> items;
  final String? boxId;
  final String? boxStatus;
  final double? temperature;
  final double? batteryPercent;
  final String? lastReadingTime;

  factory DriverDelivery.fromApi(Map<String, dynamic> json) {
    final recipient = json['recipient'] is Map ? Map<String, dynamic>.from(json['recipient'] as Map) : {};
    final pickup = json['pickup'] is Map ? Map<String, dynamic>.from(json['pickup'] as Map) : {};
    final monitoring = json['monitoring'] is Map ? Map<String, dynamic>.from(json['monitoring'] as Map) : {};
    final rawItems = json['items'] as List? ?? [];

    return DriverDelivery(
      orderId: json['orderId']?.toString() ?? '',
      orderNumber: json['orderNumber']?.toString() ?? '',
      status: json['status']?.toString() ?? 'pending',
      recipientName: recipient['name']?.toString() ?? 'Student',
      school: recipient['school']?.toString() ?? '',
      recipientContact: recipient['contact']?.toString() ?? '',
      pickupLocation: pickup['name']?.toString() ?? 'Pickup Point',
      pickupTime: pickup['time']?.toString() ?? 'Morning Slot',
      specialInstructions: json['specialInstructions']?.toString() ?? '',
      items: rawItems.map((i) => '${i['quantity']}x ${i['name']}').toList(),
      boxId: monitoring['boxId']?.toString(),
      boxStatus: monitoring['boxStatus']?.toString(),
      temperature: (monitoring['temperature'] as num?)?.toDouble(),
      batteryPercent: (monitoring['batteryPercent'] as num?)?.toDouble(),
      lastReadingTime: monitoring['lastReadingTime']?.toString(),
    );
  }
}

class DriverRepository {
  DriverRepository(this._dio);
  final Dio _dio;

  Future<List<DriverDelivery>> getDeliveries() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>(
        'driver/deliveries',
        options: Options(extra: {'requiresAuth': true}),
      );
      final rawData = response.data?['data'];
      final data = rawData is Map ? Map<String, dynamic>.from(rawData) : null;
      final list = data?['deliveries'];
      if (list is! List) return const [];
      return list
          .whereType<Map>()
          .map((json) => DriverDelivery.fromApi(Map<String, dynamic>.from(json)))
          .toList();
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }

  Future<void> confirmDispatch(String orderId) async {
    try {
      await _dio.post(
        'driver/deliveries/$orderId/dispatch',
        options: Options(extra: {'requiresAuth': true}),
      );
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }

  Future<void> completeHandover(String orderId, {String notes = ''}) async {
    try {
      await _dio.post(
        'driver/deliveries/$orderId/complete',
        data: {'notes': notes, 'recipientConfirmed': true},
        options: Options(extra: {'requiresAuth': true}),
      );
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }

  Future<void> reportIncident(String orderId, String incidentType, String description) async {
    try {
      await _dio.post(
        'driver/deliveries/$orderId/incident',
        data: {'incidentType': incidentType, 'description': description},
        options: Options(extra: {'requiresAuth': true}),
      );
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }
}


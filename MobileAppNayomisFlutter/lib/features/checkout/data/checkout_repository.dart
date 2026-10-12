import 'package:dio/dio.dart';

import '../../../core/networking/api_error_mapper.dart';

class PickupPoint {
  const PickupPoint({
    required this.id,
    required this.name,
    required this.school,
    required this.address,
    required this.timeSlots,
  });
  final String id;
  final String name;
  final String school;
  final String address;
  final List<String> timeSlots;

  factory PickupPoint.fromApi(Map<String, dynamic> json) {
    final school = json['school'] is Map
        ? Map<String, dynamic>.from(json['school'] as Map)
        : const <String, dynamic>{};
    final location = json['location'] is Map
        ? Map<String, dynamic>.from(json['location'] as Map)
        : const <String, dynamic>{};
    final slots =
        (json['timeSlots'] as List?)
            ?.whereType<Map>()
            .map(Map<String, dynamic>.from)
            .where(
              (slot) =>
                  (slot['currentBookings'] as num? ?? 0) <
                  (slot['capacity'] as num? ?? 0),
            )
            .map((slot) => slot['slot'].toString())
            .toList() ??
        const <String>[];
    return PickupPoint(
      id: (json['_id'] ?? json['id']).toString(),
      name: json['name']?.toString() ?? 'Pickup point',
      school: school['name']?.toString() ?? '',
      address: location['address']?.toString() ?? '',
      timeSlots: slots,
    );
  }
}

class CheckoutRepository {
  CheckoutRepository(this._dio);
  final Dio _dio;

  Future<List<PickupPoint>> pickupPoints() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('pickup-points');
      final rawData = response.data?['data'];
      final data = rawData is Map ? Map<String, dynamic>.from(rawData) : null;
      final list = data?['pickupPoints'];
      if (list is! List) return const [];
      return list
          .whereType<Map>()
          .map((json) => PickupPoint.fromApi(Map<String, dynamic>.from(json)))
          .toList();
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }

  Future<String> placeCashOrder({
    required List<Map<String, Object>> items,
    required String pickupPointId,
    required DateTime deliveryDate,
    required String timeSlot,
    required String idempotencyKey,
    String specialInstructions = '',
  }) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        'customer/orders',
        data: {
          'items': items,
          'pickupPointId': pickupPointId,
          'deliveryDate': deliveryDate.toIso8601String(),
          'timeSlot': timeSlot,
          'specialInstructions': specialInstructions,
          'paymentMethod': 'cash_on_delivery',
        },
        options: Options(
          headers: {'Idempotency-Key': idempotencyKey},
          extra: {'requiresAuth': true},
        ),
      );
      final rawData = response.data?['data'];
      final data = rawData is Map ? Map<String, dynamic>.from(rawData) : null;
      final rawOrder = data?['order'];
      final order = rawOrder is Map ? Map<String, dynamic>.from(rawOrder) : null;
      final id = order?['_id'] ?? order?['id'];
      if (id == null) throw const FormatException('Order response did not include an ID.');
      return id.toString();
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }
}

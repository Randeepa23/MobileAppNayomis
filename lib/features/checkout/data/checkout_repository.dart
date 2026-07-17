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
}

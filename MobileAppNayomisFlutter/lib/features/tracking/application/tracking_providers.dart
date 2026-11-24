import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/networking/api_client.dart';
import '../data/tracking_repository.dart';

final trackingRepositoryProvider = Provider<TrackingRepository>((ref) {
  return TrackingRepository(ref.watch(dioProvider));
});

final latestTrackingProvider = FutureProvider.autoDispose.family<LiveSensorSnapshot, String>((ref, orderId) async {
  final repo = ref.watch(trackingRepositoryProvider);
  return repo.getLatestReading(orderId);
});


import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/networking/api_client.dart';
import '../data/tracking_repository.dart';

final trackingRepositoryProvider = Provider<TrackingRepository>((ref) {
  return TrackingRepository(ref.watch(dioProvider));
});

final latestTrackingProvider = FutureProvider.autoDispose.family<LiveSensorSnapshot, String>((ref, orderId) async {
  final repo = ref.watch(trackingRepositoryProvider);
  // Auto-refresh sensor readings every 5 seconds while tracking screen is active
  final timer = Timer(const Duration(seconds: 5), () {
    ref.invalidateSelf();
  });
  ref.onDispose(() => timer.cancel());
  return repo.getLatestReading(orderId);
});


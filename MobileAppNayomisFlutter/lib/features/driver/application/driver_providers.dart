import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/networking/api_client.dart';
import '../data/driver_repository.dart';

final driverRepositoryProvider = Provider<DriverRepository>((ref) {
  return DriverRepository(ref.watch(dioProvider));
});

final driverDeliveriesProvider = FutureProvider.autoDispose<List<DriverDelivery>>((ref) async {
  final repo = ref.watch(driverRepositoryProvider);
  return repo.getDeliveries();
});


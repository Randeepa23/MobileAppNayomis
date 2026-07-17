import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/api_client.dart';
import '../data/checkout_repository.dart';

final checkoutRepositoryProvider = Provider<CheckoutRepository>(
  (ref) => CheckoutRepository(ref.watch(dioProvider)),
);
final pickupPointsProvider = FutureProvider<List<PickupPoint>>(
  (ref) => ref.watch(checkoutRepositoryProvider).pickupPoints(),
);

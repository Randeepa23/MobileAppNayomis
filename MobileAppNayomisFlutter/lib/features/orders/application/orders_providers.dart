import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/networking/api_client.dart';
import '../data/orders_repository.dart';

final ordersRepositoryProvider = Provider<OrdersRepository>((ref) {
  return OrdersRepository(ref.watch(dioProvider));
});

final customerOrdersProvider = FutureProvider.autoDispose<List<CustomerOrder>>((ref) async {
  final repo = ref.watch(ordersRepositoryProvider);
  return repo.getOrders();
});


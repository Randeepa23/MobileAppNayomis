import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';

import '../../../shared/widgets/app_widgets.dart';
import '../../authentication/application/auth_controller.dart';
import '../../cart/application/cart_controller.dart';
import '../../../core/persistence/app_database.dart';
import '../application/checkout_providers.dart';
import '../data/checkout_repository.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});
  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  int _step = 0;
  PickupPoint? _pickup;
  DateTime? _date;
  String? _slot;
  final _instructions = TextEditingController();
  final _idempotencyKey = const Uuid().v4();
  bool _submitting = false;

  @override
  void dispose() {
    _instructions.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final customer = ref.watch(authControllerProvider).value?.customer;
    final cart = ref.watch(cartProvider).value ?? const [];
    final subtotal = ref.watch(cartSubtotalProvider);
    return Scaffold(
      appBar: const BrandedAppBar(title: 'School breakfast checkout'),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: CheckoutStepIndicator(current: _step + 1, total: 8),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: _content(customer?.name ?? '', cart, subtotal),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  if (_step > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => setState(() => _step--),
                        child: const Text('Back'),
                      ),
                    ),
                  if (_step > 0) const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _submitting || !_canContinue(cart)
                          ? null
                          : () {
                              if (_step < 7) {
                                setState(() => _step++);
                              } else { _submitOrder(cart); }
                            }
                          : null,
                      child: Text(_submitting ? 'Placing order…' : _step == 7 ? 'Place cash order' : 'Next'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitOrder(List<CartEntry> cart) async {
    setState(() => _submitting = true);
    try {
      final orderId = await ref.read(checkoutRepositoryProvider).placeCashOrder(
        items: cart.map((item) => <String, Object>{'foodId': item.itemId, 'quantity': item.quantity}).toList(),
        pickupPointId: _pickup!.id,
        deliveryDate: _date!, timeSlot: _slot!,
        specialInstructions: _instructions.text,
        idempotencyKey: _idempotencyKey,
      );
      await ref.read(cartControllerProvider).clear();
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Order $orderId confirmed. Pay cash on delivery.')));
      context.go('/orders');
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  bool _canContinue(List<CartEntry> cart) => switch (_step) {
    0 => cart.isNotEmpty,
    1 => true,
    2 => _pickup != null,
    3 => _date != null,
    4 => _slot != null,
    _ => true,
  };

  Widget _content(
    String customerName,
    List<CartEntry> cart,
    double subtotal,
  ) => switch (_step) {
    0 => _Step(
      title: 'Review cart',
      child: Column(
        children: [
          Text('${cart.length} line items'),
          const SizedBox(height: 8),
          Text('Estimated subtotal: ${formatLkr(subtotal)}'),
          const SizedBox(height: 8),
          const Text('The server owns final prices, availability, and totals.'),
        ],
      ),
    ),
    1 => _Step(
      title: 'Select student',
      child: Card(
        child: ListTile(
          leading: const Icon(Icons.school_outlined),
          title: Text(customerName),
          subtitle: const Text('Current authenticated customer profile'),
        ),
      ),
    ),
    2 => _Step(
      title: 'Select pickup point',
      child: ref
          .watch(pickupPointsProvider)
          .when(
            loading: () => const SizedBox(height: 160, child: LoadingState()),
            error: (error, _) => ErrorState(
              message: error.toString(),
              action: ElevatedButton(
                onPressed: () => ref.invalidate(pickupPointsProvider),
                child: const Text('Retry'),
              ),
            ),
            data: (points) => DropdownButtonFormField<PickupPoint>(
              initialValue: _pickup,
              decoration: const InputDecoration(labelText: 'Pickup point'),
              items: points
                  .map(
                    (point) =>
                        DropdownMenuItem(value: point, child: Text(point.name)),
                  )
                  .toList(),
              onChanged: (value) => setState(() {
                _pickup = value;
                _slot = null;
              }),
            ),
          ),
    ),
    3 => _Step(
      title: 'Select delivery date',
      child: ListTile(
        title: Text(
          _date == null
              ? 'No date selected'
              : DateFormat.yMMMMEEEEd().format(_date!),
        ),
        trailing: const Icon(Icons.calendar_month),
        onTap: () async {
          final now = DateTime.now();
          final value = await showDatePicker(
            context: context,
            firstDate: DateTime(now.year, now.month, now.day + 1),
            lastDate: DateTime(now.year, now.month, now.day + 7),
          );
          if (value != null) setState(() => _date = value);
        },
      ),
    ),
    4 => _Step(
      title: 'Select time slot',
      child: (_pickup?.timeSlots.isEmpty ?? true)
          ? const Text('No server-supplied slots are currently available.')
          : Wrap(
              spacing: 8,
              children: _pickup!.timeSlots
                  .map(
                    (slot) => ChoiceChip(
                      label: Text(slot),
                      selected: _slot == slot,
                      onSelected: (_) => setState(() => _slot = slot),
                    ),
                  )
                  .toList(),
            ),
    ),
    5 => _Step(
      title: 'Special instructions',
      child: TextField(
        controller: _instructions,
        maxLength: 500,
        maxLines: 4,
        decoration: const InputDecoration(
          labelText: 'Instructions (optional)',
          hintText: 'Preparation or pickup notes',
        ),
      ),
    ),
    6 => const _Step(
      title: 'Payment',
      child: Card(
        child: ListTile(
          leading: Icon(Icons.payments_outlined),
          title: Text('Cash on delivery'),
          subtitle: Text(
            'Pay cash when your order is delivered or collected.',
          ),
        ),
      ),
    ),
    _ => _Step(
      title: 'Review and confirm',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Student: $customerName'),
          Text('Pickup: ${_pickup?.name}'),
          Text(
            'Date: ${_date == null ? '' : DateFormat.yMMMd().format(_date!)}',
          ),
          Text('Slot: ${_slot ?? ''}'),
          Text('Estimated subtotal: ${formatLkr(subtotal)}'),
          const SizedBox(height: 12),
          const SafetyStatusPanel(status: SafetyStatus.offline),
          const Text(
            'The final price and availability are confirmed securely by the server.',
          ),
        ],
      ),
    ),
  };
}

class _Step extends StatelessWidget {
  const _Step({required this.title, required this.child});
  final String title;
  final Widget child;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        title,
        style: Theme.of(
          context,
        ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
      ),
      const SizedBox(height: 16),
      child,
    ],
  );
}

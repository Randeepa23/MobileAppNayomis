import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/connectivity/connectivity_provider.dart';
import '../../features/authentication/application/auth_controller.dart';

class AppStatusOverlay extends ConsumerWidget {
  const AppStatusOverlay({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final online = ref.watch(connectivityProvider).value ?? true;
    final expired =
        ref.watch(authControllerProvider).value?.sessionExpired == true;
    return Column(
      children: [
        if (!online)
          Material(
            color: Colors.grey.shade800,
            child: const SafeArea(
              bottom: false,
              child: ListTile(
                dense: true,
                textColor: Colors.white,
                iconColor: Colors.white,
                leading: Icon(Icons.cloud_off_outlined),
                title: Text(
                  'Offline — live restaurant data may be unavailable',
                ),
              ),
            ),
          ),
        if (expired)
          Material(
            color: Theme.of(context).colorScheme.errorContainer,
            child: SafeArea(
              bottom: false,
              child: ListTile(
                dense: true,
                leading: const Icon(Icons.lock_clock_outlined),
                title: const Text(
                  'Your session expired. Sign in again to continue.',
                ),
                trailing: TextButton(
                  onPressed: () => ref
                      .read(authControllerProvider.notifier)
                      .acknowledgeExpiry(),
                  child: const Text('Dismiss'),
                ),
              ),
            ),
          ),
        Expanded(child: child),
      ],
    );
  }
}

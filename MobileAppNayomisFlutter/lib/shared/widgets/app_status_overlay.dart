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
    return Material(
      color: Colors.transparent,
      child: Column(
        children: [
          if (!online)
            Material(
              color: Colors.grey.shade900,
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: [
                      const Icon(Icons.cloud_off_outlined, color: Colors.white, size: 18),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          'Offline — live restaurant data may be unavailable',
                          style: TextStyle(color: Colors.white, fontSize: 12),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      GestureDetector(
                        onTap: () => ref.refresh(connectivityProvider),
                        child: const Padding(
                          padding: EdgeInsets.all(4.0),
                          child: Icon(Icons.refresh, color: Colors.white, size: 18),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          if (expired)
            Material(
              color: Theme.of(context).colorScheme.errorContainer,
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: [
                      const Icon(Icons.lock_clock_outlined, size: 18),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          'Your session expired. Sign in again to continue.',
                          style: TextStyle(fontSize: 12),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      GestureDetector(
                        onTap: () => ref
                            .read(authControllerProvider.notifier)
                            .acknowledgeExpiry(),
                        child: const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          child: Text(
                            'Dismiss',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          Expanded(child: child),
        ],
      ),
    );
  }
}

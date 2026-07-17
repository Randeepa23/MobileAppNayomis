import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/design_system/app_theme.dart';
import '../shared/widgets/app_status_overlay.dart';
import 'router/app_router.dart';

class NayomisApp extends ConsumerWidget {
  const NayomisApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) => MaterialApp.router(
    debugShowCheckedModeBanner: false,
    title: "Nayomi's Waterfront",
    theme: AppTheme.light,
    routerConfig: ref.watch(appRouterProvider),
    builder: (context, child) =>
        AppStatusOverlay(child: child ?? const SizedBox.shrink()),
  );
}

import 'dart:async';
import 'dart:io';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

Future<bool> _isActuallyOnline(List<ConnectivityResult> results) async {
  final hasInterface = results.any(
    (r) =>
        r == ConnectivityResult.wifi ||
        r == ConnectivityResult.mobile ||
        r == ConnectivityResult.ethernet,
  );
  if (hasInterface) return true;

  // On iOS Simulator or virtual networks, NWPathMonitor occasionally emits none while idle.
  // Verify with a real DNS lookup before falsely declaring the app offline.
  if (!kIsWeb) {
    try {
      final lookup = await InternetAddress.lookup('dns.google')
          .timeout(const Duration(seconds: 2));
      return lookup.isNotEmpty && lookup[0].rawAddress.isNotEmpty;
    } catch (_) {
      return false;
    }
  }
  return false;
}

final connectivityProvider = StreamProvider<bool>((ref) async* {
  final connectivity = Connectivity();
  final initial = await connectivity.checkConnectivity();
  yield await _isActuallyOnline(initial);
  await for (final results in connectivity.onConnectivityChanged) {
    yield await _isActuallyOnline(results);
  }
});

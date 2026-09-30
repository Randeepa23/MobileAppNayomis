import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:timezone/data/latest.dart' as timezone_data;

import '../core/networking/api_client.dart';
import '../core/security/session_storage.dart';
import 'app.dart';
import 'environment/app_environment.dart';

Future<void> bootstrap(AppEnvironment environment) async {
  WidgetsFlutterBinding.ensureInitialized();
  timezone_data.initializeTimeZones();
  const secureStorage = FlutterSecureStorage();
  runApp(
    ProviderScope(
      overrides: [
        environmentProvider.overrideWithValue(environment),
        sessionStorageProvider.overrideWithValue(SessionStorage(secureStorage)),
      ],
      child: const NayomisApp(),
    ),
  );
}

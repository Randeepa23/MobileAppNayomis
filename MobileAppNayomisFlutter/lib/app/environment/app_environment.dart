import 'package:flutter/foundation.dart';

enum AppEnvironment { development, staging, production }

extension AppEnvironmentConfig on AppEnvironment {
  String get label => switch (this) {
    AppEnvironment.development => 'Development',
    AppEnvironment.staging => 'Staging',
    AppEnvironment.production => 'Production',
  };

  String get defaultApiBaseUrl => switch (this) {
    AppEnvironment.development => 'https://nayomis-backend.onrender.com/api/',
    AppEnvironment.staging => 'https://nayomis-backend.onrender.com/api/',
    AppEnvironment.production => 'https://nayomis-backend.onrender.com/api/',
  };

  String get apiBaseUrl {
    const override = String.fromEnvironment('API_BASE_URL');
    final value = override.isEmpty ? defaultApiBaseUrl : override;
    final uri = Uri.tryParse(value);
    if (uri == null || !uri.hasScheme || !value.endsWith('/')) {
      throw StateError('API_BASE_URL must be an absolute URL ending in /.');
    }
    if (uri.scheme != 'https' && !kDebugMode) {
      throw StateError('Production API URLs must use HTTPS.');
    }
    return value;
  }
}

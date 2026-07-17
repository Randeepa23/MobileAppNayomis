enum AppEnvironment { development, staging, production }

extension AppEnvironmentConfig on AppEnvironment {
  String get label => switch (this) {
    AppEnvironment.development => 'Development',
    AppEnvironment.staging => 'Staging',
    AppEnvironment.production => 'Production',
  };

  String get defaultApiBaseUrl => switch (this) {
    AppEnvironment.development => 'http://10.0.2.2:5000/api/',
    AppEnvironment.staging => 'https://staging.example.invalid/api/',
    AppEnvironment.production => 'https://api.example.invalid/api/',
  };

  String get apiBaseUrl {
    const override = String.fromEnvironment('API_BASE_URL');
    final value = override.isEmpty ? defaultApiBaseUrl : override;
    final uri = Uri.tryParse(value);
    if (uri == null || !uri.hasScheme || !value.endsWith('/')) {
      throw StateError('API_BASE_URL must be an absolute URL ending in /.');
    }
    if (this != AppEnvironment.development && uri.scheme != 'https') {
      throw StateError('Staging and production API URLs must use HTTPS.');
    }
    return value;
  }
}

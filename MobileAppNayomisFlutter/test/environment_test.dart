import 'package:flutter_test/flutter_test.dart';
import 'package:nayomis_waterfront/app/environment/app_environment.dart';

void main() {
  test('development uses a reachable HTTP API address', () {
    final uri = Uri.parse(AppEnvironment.development.apiBaseUrl);
    expect(uri.scheme, 'http');
    expect(uri.port, 5000);
    expect(uri.path, '/api/');
  });

  test('production placeholder is HTTPS', () {
    expect(Uri.parse(AppEnvironment.production.apiBaseUrl).scheme, 'https');
  });
}

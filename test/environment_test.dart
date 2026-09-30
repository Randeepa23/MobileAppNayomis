import 'package:flutter_test/flutter_test.dart';
import 'package:nayomis_waterfront/app/environment/app_environment.dart';

void main() {
  test('development uses the configured laptop LAN address', () {
    expect(
      AppEnvironment.development.apiBaseUrl,
      'http://192.168.1.47:5000/api/',
    );
  });

  test('production placeholder is HTTPS', () {
    expect(Uri.parse(AppEnvironment.production.apiBaseUrl).scheme, 'https');
  });
}

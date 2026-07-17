import 'package:flutter_test/flutter_test.dart';
import 'package:nayomis_waterfront/app/environment/app_environment.dart';

void main() {
  test('development uses the Android emulator loopback alias', () {
    expect(AppEnvironment.development.apiBaseUrl, 'http://10.0.2.2:5000/api/');
  });

  test('production placeholder is HTTPS', () {
    expect(Uri.parse(AppEnvironment.production.apiBaseUrl).scheme, 'https');
  });
}

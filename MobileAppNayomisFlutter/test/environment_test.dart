import 'package:flutter_test/flutter_test.dart';
import 'package:nayomis_waterfront/app/environment/app_environment.dart';

void main() {
  test('all environments point to live HTTPS Render API by default', () {
    final devUri = Uri.parse(AppEnvironment.development.apiBaseUrl);
    expect(devUri.scheme, 'https');
    expect(devUri.host, 'nayomis-backend.onrender.com');
    expect(devUri.path, '/api/');

    final prodUri = Uri.parse(AppEnvironment.production.apiBaseUrl);
    expect(prodUri.scheme, 'https');
    expect(prodUri.host, 'nayomis-backend.onrender.com');
    expect(prodUri.path, '/api/');
  });
}

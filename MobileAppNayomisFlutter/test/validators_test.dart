import 'package:flutter_test/flutter_test.dart';
import 'package:nayomis_waterfront/core/validation/validators.dart';

void main() {
  group('authentication validation', () {
    test('accepts a valid email and six-character password', () {
      expect(Validators.email('parent@example.com'), isNull);
      expect(Validators.password('123456'), isNull);
    });

    test('rejects malformed email and short password', () {
      expect(Validators.email('not-an-email'), isNotNull);
      expect(Validators.password('12345'), isNotNull);
    });
  });
}

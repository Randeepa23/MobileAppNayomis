import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:nayomis_waterfront/core/security/session_storage.dart';

class _MockSecureStorage extends Mock implements FlutterSecureStorage {}

void main() {
  test('stores only token lifecycle fields from a valid JWT', () async {
    final storage = _MockSecureStorage();
    when(
      () => storage.write(
        key: any(named: 'key'),
        value: any(named: 'value'),
      ),
    ).thenAnswer((_) async {});
    final expiry =
        DateTime.now()
            .toUtc()
            .add(const Duration(hours: 1))
            .millisecondsSinceEpoch ~/
        1000;
    final header = base64Url
        .encode(utf8.encode(jsonEncode({'alg': 'none'})))
        .replaceAll('=', '');
    final payload = base64Url
        .encode(
          utf8.encode(jsonEncode({'studentId': 'customer-id', 'exp': expiry})),
        )
        .replaceAll('=', '');

    await SessionStorage(storage).writeToken('$header.$payload.signature');

    verify(
      () => storage.write(
        key: any(named: 'key'),
        value: any(named: 'value'),
      ),
    ).called(3);
  });

  test('rejects an expired JWT', () async {
    final storage = _MockSecureStorage();
    final expiry =
        DateTime.now()
            .toUtc()
            .subtract(const Duration(minutes: 1))
            .millisecondsSinceEpoch ~/
        1000;
    final header = base64Url.encode(utf8.encode('{}')).replaceAll('=', '');
    final payload = base64Url
        .encode(utf8.encode(jsonEncode({'studentId': 'id', 'exp': expiry})))
        .replaceAll('=', '');

    expect(
      () => SessionStorage(storage).writeToken('$header.$payload.signature'),
      throwsFormatException,
    );
  });
}

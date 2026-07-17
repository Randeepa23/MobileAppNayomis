import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StoredSession {
  const StoredSession({
    required this.token,
    required this.customerId,
    required this.expiresAt,
  });

  final String token;
  final String customerId;
  final DateTime expiresAt;

  bool get isExpired => !expiresAt.isAfter(DateTime.now().toUtc());
}

class SessionStorage {
  SessionStorage(this._storage);

  static const _tokenKey = 'customer_jwt';
  static const _customerKey = 'customer_id';
  static const _expiryKey = 'customer_jwt_expiry';
  final FlutterSecureStorage _storage;

  Future<StoredSession?> read() async {
    final values = await Future.wait([
      _storage.read(key: _tokenKey),
      _storage.read(key: _customerKey),
      _storage.read(key: _expiryKey),
    ]);
    if (values.any((value) => value == null || value.isEmpty)) return null;
    final expiry = DateTime.tryParse(values[2]!);
    if (expiry == null) return null;
    return StoredSession(
      token: values[0]!,
      customerId: values[1]!,
      expiresAt: expiry,
    );
  }

  Future<void> writeToken(String token) async {
    final payload = _parseJwtPayload(token);
    final customerId = payload['studentId']?.toString();
    final expirySeconds = payload['exp'];
    if (customerId == null || customerId.isEmpty || expirySeconds is! num) {
      throw const FormatException('Malformed customer session.');
    }
    final expiry = DateTime.fromMillisecondsSinceEpoch(
      expirySeconds.toInt() * 1000,
      isUtc: true,
    );
    if (!expiry.isAfter(DateTime.now().toUtc())) {
      throw const FormatException('Expired customer session.');
    }
    await _storage.write(key: _tokenKey, value: token);
    await _storage.write(key: _customerKey, value: customerId);
    await _storage.write(key: _expiryKey, value: expiry.toIso8601String());
  }

  Future<void> clear() => _storage.deleteAll();

  Map<String, Object?> _parseJwtPayload(String token) {
    final parts = token.split('.');
    if (parts.length != 3) throw const FormatException('Malformed JWT.');
    final decoded = utf8.decode(
      base64Url.decode(base64Url.normalize(parts[1])),
    );
    final value = jsonDecode(decoded);
    if (value is! Map<String, dynamic>) {
      throw const FormatException('Malformed JWT payload.');
    }
    return value;
  }
}

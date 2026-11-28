import '../../../core/networking/api_error_mapper.dart';
import '../../../core/security/session_storage.dart';
import '../domain/customer.dart';
import 'auth_api.dart';

class AuthRepository {
  AuthRepository(this._api, this._storage);
  final AuthApi _api;
  final SessionStorage _storage;

  Future<Customer> login(String email, String password) async {
    try {
      final result = await _api.login(email: email, password: password);
      await _storage.writeToken(result.token);
      return result.customer;
    } catch (error) {
      await _storage.clear();
      throw ApiErrorMapper.from(error);
    }
  }

  Future<void> register(
    String name,
    String email,
    String password, {
    String? phone,
  }) async {
    try {
      await _api.register(
        name: name,
        email: email,
        password: password,
        phone: phone,
      );
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }

  Future<void> logout() => _storage.clear();

  Future<Customer?> restoreSession() async {
    try {
      final session = await _storage.read();
      if (session == null || session.isExpired) {
        await _storage.clear();
        return null;
      }
      return await _api.currentCustomer();
    } catch (_) {
      return null;
    }
  }
}

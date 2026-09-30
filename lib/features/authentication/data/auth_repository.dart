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
      return await _api.currentCustomer();
    } catch (error) {
      await _storage.clear();
      throw ApiErrorMapper.from(error);
    }
  }

  Future<void> register(String name, String email, String password) async {
    try {
      await _api.register(name: name, email: email, password: password);
    } catch (error) {
      throw ApiErrorMapper.from(error);
    }
  }

  Future<void> logout() => _storage.clear();
}

import 'package:dio/dio.dart';

import '../../../core/errors/app_failure.dart';
import '../../../core/networking/api_response_dto.dart';
import '../domain/customer.dart';

class LoginResult {
  const LoginResult({required this.token, required this.customer});
  final String token;
  final Customer customer;
}

class AuthApi {
  AuthApi(this._dio);
  final Dio _dio;

  Future<void> register({
    required String name,
    required String email,
    required String password,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      'students/register',
      data: {
        'name': name.trim(),
        'email': email.trim().toLowerCase(),
        'password': password,
      },
    );
    final envelope = ApiResponseDto.fromJson(response.data ?? const {});
    if (!envelope.success) {
      throw AppFailure(
        envelope.message ?? 'Unable to create account.',
        code: envelope.code,
      );
    }
  }

  Future<LoginResult> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      'students/login',
      data: {'email': email.trim().toLowerCase(), 'password': password},
    );
    final rawData = response.data?['data'];
    if (rawData is! Map) {
      throw const AppFailure(
        'The server returned an invalid sign-in response.',
      );
    }
    final data = Map<String, dynamic>.from(rawData);
    final rawStudent = data['student'];
    if (data['token'] is! String || rawStudent is! Map) {
      throw const AppFailure(
        'The server returned an invalid sign-in response.',
      );
    }
    return LoginResult(
      token: data['token'] as String,
      customer: Customer.fromApi(Map<String, dynamic>.from(rawStudent)),
    );
  }

  Future<Customer> currentCustomer() async {
    final response = await _dio.get<Map<String, dynamic>>(
      'students/me',
      options: Options(extra: {'requiresAuth': true}),
    );
    final rawData = response.data?['data'];
    final data = rawData is Map ? Map<String, dynamic>.from(rawData) : null;
    final student = data?['student'];
    if (student is! Map) {
      throw const AppFailure('The server returned an invalid profile.');
    }
    return Customer.fromApi(Map<String, dynamic>.from(student));
  }
}

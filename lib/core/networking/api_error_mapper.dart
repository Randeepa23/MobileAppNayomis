import 'package:dio/dio.dart';

import '../errors/app_failure.dart';

abstract final class ApiErrorMapper {
  static AppFailure from(Object error) {
    if (error is AppFailure) return error;
    if (error is DioException) {
      final data = error.response?.data;
      if (data is Map) {
        final errors = <String, String>{};
        final rawErrors = data['errors'];
        if (rawErrors is Map) {
          for (final entry in rawErrors.entries) {
            if (entry.value is String) {
              errors[entry.key.toString()] = entry.value as String;
            }
          }
        }
        return AppFailure(
          data['message']?.toString() ?? _fallback(error),
          code: data['code']?.toString(),
          fieldErrors: errors,
        );
      }
      return AppFailure(_fallback(error));
    }
    return const AppFailure('Something went wrong. Please try again.');
  }

  static String _fallback(DioException error) => switch (error.type) {
    DioExceptionType.connectionError ||
    DioExceptionType.connectionTimeout ||
    DioExceptionType.receiveTimeout ||
    DioExceptionType.sendTimeout =>
      'Unable to reach the server. Check your connection and try again.',
    _ => 'The server could not complete this request.',
  };
}

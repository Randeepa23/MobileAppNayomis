import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';

import '../../app/environment/app_environment.dart';
import '../../features/authentication/application/auth_controller.dart';
import '../security/session_storage.dart';

final environmentProvider = Provider<AppEnvironment>((ref) {
  throw StateError('AppEnvironment was not provided during bootstrap.');
});

final sessionStorageProvider = Provider<SessionStorage>((ref) {
  throw StateError('SessionStorage was not provided during bootstrap.');
});

final dioProvider = Provider<Dio>((ref) {
  final environment = ref.watch(environmentProvider);
  final dio = Dio(
    BaseOptions(
      baseUrl: environment.apiBaseUrl,
      connectTimeout: const Duration(seconds: 12),
      receiveTimeout: const Duration(seconds: 20),
      sendTimeout: const Duration(seconds: 20),
      headers: const {'Accept': 'application/json'},
    ),
  );
  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        options.headers['X-Request-ID'] = const Uuid().v4();
        if (options.extra['requiresAuth'] == true) {
          final session = await ref.read(sessionStorageProvider).read();
          if (session != null && !session.isExpired) {
            options.headers['Authorization'] = 'Bearer ' + session.token;
          }
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        final protected = error.requestOptions.extra['requiresAuth'] == true;
        if (protected && error.response?.statusCode == 401) {
          await ref.read(sessionStorageProvider).clear();
          ref.read(authControllerProvider.notifier).expireSession();
        }
        handler.next(error);
      },
    ),
  );
  return dio;
});

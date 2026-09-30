import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/networking/api_client.dart';
import '../data/auth_api.dart';
import '../data/auth_repository.dart';
import '../domain/customer.dart';

class AuthState {
  const AuthState({this.customer, this.sessionExpired = false});
  final Customer? customer;
  final bool sessionExpired;
  bool get isAuthenticated => customer != null;
}

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(
    AuthApi(ref.watch(dioProvider)),
    ref.watch(sessionStorageProvider),
  ),
);

final authControllerProvider = AsyncNotifierProvider<AuthController, AuthState>(
  AuthController.new,
);
final registrationControllerProvider =
    AsyncNotifierProvider<RegistrationController, void>(
      RegistrationController.new,
    );

class AuthController extends AsyncNotifier<AuthState> {
  @override
  Future<AuthState> build() async {
    await ref.read(authRepositoryProvider).logout();
    return const AuthState();
  }

  Future<bool> login(String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final customer = await ref
          .read(authRepositoryProvider)
          .login(email, password);
      return AuthState(customer: customer);
    });
    return !state.hasError;
  }

  Future<void> logout() async {
    await ref.read(authRepositoryProvider).logout();
    state = const AsyncData(AuthState());
  }

  void expireSession() {
    state = const AsyncData(AuthState(sessionExpired: true));
  }

  void acknowledgeExpiry() {
    final value = state.value;
    if (value?.sessionExpired == true) state = const AsyncData(AuthState());
  }
}

class RegistrationController extends AsyncNotifier<void> {
  @override
  Future<void> build() async {}

  Future<bool> register(String name, String email, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(authRepositoryProvider).register(name, email, password),
    );
    return !state.hasError;
  }
}

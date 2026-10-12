import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:nayomis_waterfront/features/authentication/application/auth_controller.dart';
import 'package:nayomis_waterfront/features/authentication/data/auth_repository.dart';

class _MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  test('startup clears any stored session and requires login', () async {
    final repository = _MockAuthRepository();
    when(() => repository.logout()).thenAnswer((_) async {});
    final container = ProviderContainer(
      overrides: [authRepositoryProvider.overrideWithValue(repository)],
    );
    addTearDown(container.dispose);

    final state = await container.read(authControllerProvider.future);

    expect(state.isAuthenticated, isFalse);
    expect(state.customer, isNull);
    verify(() => repository.logout()).called(1);
    verifyNoMoreInteractions(repository);
  });
}

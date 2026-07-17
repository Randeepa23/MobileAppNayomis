import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final preferencesProvider = Provider<SharedPreferences>((ref) {
  throw StateError('SharedPreferences was not provided during bootstrap.');
});

final onboardingControllerProvider =
    NotifierProvider<OnboardingController, bool>(OnboardingController.new);

class OnboardingController extends Notifier<bool> {
  static const _key = 'onboarding_complete';

  @override
  bool build() => ref.watch(preferencesProvider).getBool(_key) ?? false;

  Future<void> complete() async {
    await ref.read(preferencesProvider).setBool(_key, true);
    state = true;
  }
}

abstract final class Validators {
  static final _email = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');

  static String? required(String? value, String label) =>
      value == null || value.trim().isEmpty ? '$label is required.' : null;

  static String? email(String? value) {
    final requiredError = required(value, 'Email');
    if (requiredError != null) return requiredError;
    return _email.hasMatch(value!.trim())
        ? null
        : 'Enter a valid email address.';
  }

  static String? password(String? value) {
    final requiredError = required(value, 'Password');
    if (requiredError != null) return requiredError;
    return value!.length >= 6
        ? null
        : 'Password must be at least 6 characters.';
  }
}

class AppFailure implements Exception {
  const AppFailure(this.message, {this.code, this.fieldErrors = const {}});

  final String message;
  final String? code;
  final Map<String, String> fieldErrors;

  @override
  String toString() => message;
}

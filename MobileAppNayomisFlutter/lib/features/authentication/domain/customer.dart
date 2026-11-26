class Customer {
  const Customer({
    required this.id,
    required this.name,
    required this.email,
    required this.points,
    this.role,
    this.school,
    this.grade,
  });

  final String id;
  final String name;
  final String email;
  final double points;
  final String? role;
  final String? school;
  final String? grade;

  bool get isDriver => role == 'driver';
  bool get isAdmin => role == 'admin';

  String get pointsDisplay =>
      points % 1 == 0 ? points.toInt().toString() : points.toStringAsFixed(1);

  factory Customer.fromApi(Map<String, dynamic> json) => Customer(
    id: (json['_id'] ?? json['id']).toString(),
    name: json['name']?.toString() ?? '',
    email: json['email']?.toString() ?? '',
    points:
        (json['points'] as num?)?.toDouble() ??
        (json['loyaltyPoints'] as num?)?.toDouble() ??
        0.0,
    role: json['role']?.toString(),
    school: json['school']?.toString(),
    grade: json['grade']?.toString(),
  );
}

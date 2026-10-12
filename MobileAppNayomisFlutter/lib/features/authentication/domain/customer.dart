class Customer {
  const Customer({
    required this.id,
    required this.name,
    required this.email,
    required this.points,
    this.school,
    this.grade,
  });

  final String id;
  final String name;
  final String email;
  final int points;
  final String? school;
  final String? grade;

  factory Customer.fromApi(Map<String, dynamic> json) => Customer(
    id: (json['_id'] ?? json['id']).toString(),
    name: json['name']?.toString() ?? '',
    email: json['email']?.toString() ?? '',
    points:
        (json['points'] as num?)?.toInt() ??
        (json['loyaltyPoints'] as num?)?.toInt() ??
        0,
    school: json['school']?.toString(),
    grade: json['grade']?.toString(),
  );
}

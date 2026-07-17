import 'package:json_annotation/json_annotation.dart';

part 'api_response_dto.g.dart';

@JsonSerializable(createToJson: false)
class ApiResponseDto {
  const ApiResponseDto({required this.success, this.message, this.code});
  final bool success;
  final String? message;
  final String? code;

  factory ApiResponseDto.fromJson(Map<String, dynamic> json) =>
      _$ApiResponseDtoFromJson(json);
}

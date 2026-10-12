import 'package:timezone/timezone.dart' as tz;

class OpeningStatus {
  const OpeningStatus({required this.isOpen, required this.message});
  final bool isOpen;
  final String message;
}

OpeningStatus colomboOpeningStatus() {
  final now = tz.TZDateTime.now(tz.getLocation('Asia/Colombo'));
  final openingHour = now.weekday == DateTime.monday ? 7 : 6;
  final isOpen = now.hour >= openingHour && now.hour < 23;
  return OpeningStatus(
    isOpen: isOpen,
    message: isOpen
        ? 'Open now · Closes at 11:00 PM'
        : 'Closed · Opens at ${openingHour == 7 ? '7:00' : '6:00'} AM',
  );
}

// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Employer Portal';

  @override
  String get navDashboard => 'Dashboard';

  @override
  String get navTickets => 'Tickets';

  @override
  String get navScan => 'Scan';

  @override
  String get navPosts => 'Posts';

  @override
  String get navProfile => 'Profile';

  @override
  String get authLogin => 'Sign In';

  @override
  String get authUsername => 'Username';

  @override
  String get authPassword => 'Password';

  @override
  String get authSigninFailed => 'Login failed. Check credentials.';

  @override
  String get authLogout => 'Logout';

  @override
  String get authLogoutConfirm => 'Are you sure you want to logout?';

  @override
  String get dashboardOverview => 'Overview';

  @override
  String get dashboardQuickActions => 'Quick Actions';

  @override
  String get statTickets => 'Tickets';

  @override
  String get statCheckins => 'Check-ins';

  @override
  String get statPosts => 'Posts';

  @override
  String get statVotes => 'Votes';

  @override
  String get statRevenue => 'Revenue';

  @override
  String get actionCreateTicket => 'Create Ticket';

  @override
  String get actionCreateTicketSub => 'Create a new event ticket';

  @override
  String get actionScan => 'Scan QR Code';

  @override
  String get actionScanSub => 'Check-in attendees';

  @override
  String get actionCheckins => 'View Check-ins';

  @override
  String get actionCheckinsSub => 'All check-in history';

  @override
  String get actionNotifications => 'Notifications';

  @override
  String get ticketTitle => 'Title';

  @override
  String get ticketDescription => 'Description';

  @override
  String get ticketPrice => 'Price';

  @override
  String get ticketQuantity => 'Quantity';

  @override
  String get ticketEventDate => 'Event Date';

  @override
  String get ticketLocation => 'Location';

  @override
  String get ticketCreate => 'Create';

  @override
  String get ticketFree => 'Free';

  @override
  String ticketSold(int count) {
    return '$count sold';
  }

  @override
  String ticketLeft(int count) {
    return '$count left';
  }

  @override
  String get ticketSoldOut => 'Sold Out';

  @override
  String get ticketActive => 'Active';

  @override
  String get ticketCancelled => 'Cancelled';

  @override
  String get ticketCompleted => 'Completed';

  @override
  String get checkinScanTitle => 'Scan Ticket';

  @override
  String get checkinSuccess => 'Check-in successful!';

  @override
  String get checkinAlreadyCheckedIn => 'Already checked in';

  @override
  String get checkinInvalid => 'Invalid QR code';

  @override
  String get checkinManualEntry => 'Manual Check-in';

  @override
  String get checkinManualHint => 'Enter Purchase ID or QR code value';

  @override
  String get checkinScanNext => 'Scan Next';

  @override
  String get checkinRecentTitle => 'Check-in History';

  @override
  String get checkinEmpty => 'No check-ins yet';

  @override
  String get notificationEmpty => 'No notifications';

  @override
  String get notificationMarkAllRead => 'Mark all read';

  @override
  String get language => 'Language';

  @override
  String get errorGeneric => 'Something went wrong';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonRetry => 'Retry';

  @override
  String get commonLoading => 'Loading...';

  @override
  String get commonSave => 'Save';
}

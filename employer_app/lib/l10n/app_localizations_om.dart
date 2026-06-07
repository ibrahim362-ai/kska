// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Oromo (`om`).
class AppLocalizationsOm extends AppLocalizations {
  AppLocalizationsOm([String locale = 'om']) : super(locale);

  @override
  String get appTitle => 'Portaala Hojjettootaa';

  @override
  String get navDashboard => 'Daashboordii';

  @override
  String get navTickets => 'Tikeetiiwwan';

  @override
  String get navScan => 'Sagaleessi';

  @override
  String get navPosts => 'Poostiiwwan';

  @override
  String get navProfile => 'Profaayilii';

  @override
  String get authLogin => 'Seeni';

  @override
  String get authUsername => 'Maqaa fayyadamaa';

  @override
  String get authPassword => 'Jecha darbii';

  @override
  String get authSigninFailed => 'Seenuun hin dandeenye. Maaloo mirkaneessi.';

  @override
  String get authLogout => 'Ba\'i';

  @override
  String get authLogoutConfirm => 'Ba\'uuf mirkanaa\'aa dhaa?';

  @override
  String get dashboardOverview => 'Ilaalcha Waliigalaa';

  @override
  String get dashboardQuickActions => 'Gochoota Saffisaa';

  @override
  String get statTickets => 'Tikeetiiwwan';

  @override
  String get statCheckins => 'Galmeewwan';

  @override
  String get statPosts => 'Poostiiwwan';

  @override
  String get statVotes => 'Sagaleewwan';

  @override
  String get statRevenue => 'Galii';

  @override
  String get actionCreateTicket => 'Tikeetii uumi';

  @override
  String get actionCreateTicketSub => 'Tikeetii taarii haaraa uumi';

  @override
  String get actionScan => 'QR koodii skanii';

  @override
  String get actionScanSub => 'Hirmaattoota galmeessi';

  @override
  String get actionCheckins => 'Galmeewwan ilaali';

  @override
  String get actionCheckinsSub => 'Seenaa galmee hunda';

  @override
  String get actionNotifications => 'Beeksisa';

  @override
  String get ticketTitle => 'Mata duree';

  @override
  String get ticketDescription => 'Ibsa';

  @override
  String get ticketPrice => 'Gatii';

  @override
  String get ticketQuantity => 'Baay\'ina';

  @override
  String get ticketEventDate => 'Guyyaa taarii';

  @override
  String get ticketLocation => 'Bakka';

  @override
  String get ticketCreate => 'Uumi';

  @override
  String get ticketFree => 'Bilisaan';

  @override
  String ticketSold(int count) {
    return '$count gurgurame';
  }

  @override
  String ticketLeft(int count) {
    return '$count hafe';
  }

  @override
  String get ticketSoldOut => 'Gurgurameera';

  @override
  String get ticketActive => 'Sochii';

  @override
  String get ticketCancelled => 'Haqameera';

  @override
  String get ticketCompleted => 'Xumurameera';

  @override
  String get checkinScanTitle => 'Tikeetii skanii';

  @override
  String get checkinSuccess => 'Galmeen miltaa\'eera!';

  @override
  String get checkinAlreadyCheckedIn => 'Duraan galmaa\'era';

  @override
  String get checkinInvalid => 'QR koodii sirrii miti';

  @override
  String get checkinManualEntry => 'Galmee Harkaan';

  @override
  String get checkinManualHint =>
      'Lakkoofsa bittaa yookaan gatii QR koodii galchi';

  @override
  String get checkinScanNext => 'Kan ittaanu skanii';

  @override
  String get checkinRecentTitle => 'Seenaa galmee';

  @override
  String get checkinEmpty => 'Hanga ammaatti galmee tokkollee hin jiru';

  @override
  String get notificationEmpty => 'Beeksisni hin jiru';

  @override
  String get notificationMarkAllRead => 'Hunda akka dubbifame mallatteessi';

  @override
  String get language => 'Afaan';

  @override
  String get errorGeneric => 'Wanti dogoggora ta\'e jira';

  @override
  String get commonCancel => 'Dhiisi';

  @override
  String get commonRetry => 'Irra deebi\'i yaali';

  @override
  String get commonLoading => 'Fe\'amaa jira...';

  @override
  String get commonSave => 'Olkaa\'i';
}

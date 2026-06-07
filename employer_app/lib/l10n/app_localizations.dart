import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_am.dart';
import 'app_localizations_en.dart';
import 'app_localizations_om.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('am'),
    Locale('en'),
    Locale('om'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Employer Portal'**
  String get appTitle;

  /// No description provided for @navDashboard.
  ///
  /// In en, this message translates to:
  /// **'Dashboard'**
  String get navDashboard;

  /// No description provided for @navTickets.
  ///
  /// In en, this message translates to:
  /// **'Tickets'**
  String get navTickets;

  /// No description provided for @navScan.
  ///
  /// In en, this message translates to:
  /// **'Scan'**
  String get navScan;

  /// No description provided for @navPosts.
  ///
  /// In en, this message translates to:
  /// **'Posts'**
  String get navPosts;

  /// No description provided for @navProfile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get navProfile;

  /// No description provided for @authLogin.
  ///
  /// In en, this message translates to:
  /// **'Sign In'**
  String get authLogin;

  /// No description provided for @authUsername.
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get authUsername;

  /// No description provided for @authPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPassword;

  /// No description provided for @authSigninFailed.
  ///
  /// In en, this message translates to:
  /// **'Login failed. Check credentials.'**
  String get authSigninFailed;

  /// No description provided for @authLogout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get authLogout;

  /// No description provided for @authLogoutConfirm.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to logout?'**
  String get authLogoutConfirm;

  /// No description provided for @dashboardOverview.
  ///
  /// In en, this message translates to:
  /// **'Overview'**
  String get dashboardOverview;

  /// No description provided for @dashboardQuickActions.
  ///
  /// In en, this message translates to:
  /// **'Quick Actions'**
  String get dashboardQuickActions;

  /// No description provided for @statTickets.
  ///
  /// In en, this message translates to:
  /// **'Tickets'**
  String get statTickets;

  /// No description provided for @statCheckins.
  ///
  /// In en, this message translates to:
  /// **'Check-ins'**
  String get statCheckins;

  /// No description provided for @statPosts.
  ///
  /// In en, this message translates to:
  /// **'Posts'**
  String get statPosts;

  /// No description provided for @statVotes.
  ///
  /// In en, this message translates to:
  /// **'Votes'**
  String get statVotes;

  /// No description provided for @statRevenue.
  ///
  /// In en, this message translates to:
  /// **'Revenue'**
  String get statRevenue;

  /// No description provided for @actionCreateTicket.
  ///
  /// In en, this message translates to:
  /// **'Create Ticket'**
  String get actionCreateTicket;

  /// No description provided for @actionCreateTicketSub.
  ///
  /// In en, this message translates to:
  /// **'Create a new event ticket'**
  String get actionCreateTicketSub;

  /// No description provided for @actionScan.
  ///
  /// In en, this message translates to:
  /// **'Scan QR Code'**
  String get actionScan;

  /// No description provided for @actionScanSub.
  ///
  /// In en, this message translates to:
  /// **'Check-in attendees'**
  String get actionScanSub;

  /// No description provided for @actionCheckins.
  ///
  /// In en, this message translates to:
  /// **'View Check-ins'**
  String get actionCheckins;

  /// No description provided for @actionCheckinsSub.
  ///
  /// In en, this message translates to:
  /// **'All check-in history'**
  String get actionCheckinsSub;

  /// No description provided for @actionNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get actionNotifications;

  /// No description provided for @ticketTitle.
  ///
  /// In en, this message translates to:
  /// **'Title'**
  String get ticketTitle;

  /// No description provided for @ticketDescription.
  ///
  /// In en, this message translates to:
  /// **'Description'**
  String get ticketDescription;

  /// No description provided for @ticketPrice.
  ///
  /// In en, this message translates to:
  /// **'Price'**
  String get ticketPrice;

  /// No description provided for @ticketQuantity.
  ///
  /// In en, this message translates to:
  /// **'Quantity'**
  String get ticketQuantity;

  /// No description provided for @ticketEventDate.
  ///
  /// In en, this message translates to:
  /// **'Event Date'**
  String get ticketEventDate;

  /// No description provided for @ticketLocation.
  ///
  /// In en, this message translates to:
  /// **'Location'**
  String get ticketLocation;

  /// No description provided for @ticketCreate.
  ///
  /// In en, this message translates to:
  /// **'Create'**
  String get ticketCreate;

  /// No description provided for @ticketFree.
  ///
  /// In en, this message translates to:
  /// **'Free'**
  String get ticketFree;

  /// No description provided for @ticketSold.
  ///
  /// In en, this message translates to:
  /// **'{count} sold'**
  String ticketSold(int count);

  /// No description provided for @ticketLeft.
  ///
  /// In en, this message translates to:
  /// **'{count} left'**
  String ticketLeft(int count);

  /// No description provided for @ticketSoldOut.
  ///
  /// In en, this message translates to:
  /// **'Sold Out'**
  String get ticketSoldOut;

  /// No description provided for @ticketActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get ticketActive;

  /// No description provided for @ticketCancelled.
  ///
  /// In en, this message translates to:
  /// **'Cancelled'**
  String get ticketCancelled;

  /// No description provided for @ticketCompleted.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get ticketCompleted;

  /// No description provided for @checkinScanTitle.
  ///
  /// In en, this message translates to:
  /// **'Scan Ticket'**
  String get checkinScanTitle;

  /// No description provided for @checkinSuccess.
  ///
  /// In en, this message translates to:
  /// **'Check-in successful!'**
  String get checkinSuccess;

  /// No description provided for @checkinAlreadyCheckedIn.
  ///
  /// In en, this message translates to:
  /// **'Already checked in'**
  String get checkinAlreadyCheckedIn;

  /// No description provided for @checkinInvalid.
  ///
  /// In en, this message translates to:
  /// **'Invalid QR code'**
  String get checkinInvalid;

  /// No description provided for @checkinManualEntry.
  ///
  /// In en, this message translates to:
  /// **'Manual Check-in'**
  String get checkinManualEntry;

  /// No description provided for @checkinManualHint.
  ///
  /// In en, this message translates to:
  /// **'Enter Purchase ID or QR code value'**
  String get checkinManualHint;

  /// No description provided for @checkinScanNext.
  ///
  /// In en, this message translates to:
  /// **'Scan Next'**
  String get checkinScanNext;

  /// No description provided for @checkinRecentTitle.
  ///
  /// In en, this message translates to:
  /// **'Check-in History'**
  String get checkinRecentTitle;

  /// No description provided for @checkinEmpty.
  ///
  /// In en, this message translates to:
  /// **'No check-ins yet'**
  String get checkinEmpty;

  /// No description provided for @notificationEmpty.
  ///
  /// In en, this message translates to:
  /// **'No notifications'**
  String get notificationEmpty;

  /// No description provided for @notificationMarkAllRead.
  ///
  /// In en, this message translates to:
  /// **'Mark all read'**
  String get notificationMarkAllRead;

  /// No description provided for @language.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get language;

  /// No description provided for @errorGeneric.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong'**
  String get errorGeneric;

  /// No description provided for @commonCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commonCancel;

  /// No description provided for @commonRetry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get commonRetry;

  /// No description provided for @commonLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get commonLoading;

  /// No description provided for @commonSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commonSave;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['am', 'en', 'om'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'am':
      return AppLocalizationsAm();
    case 'en':
      return AppLocalizationsEn();
    case 'om':
      return AppLocalizationsOm();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}

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

  /// Application name
  ///
  /// In en, this message translates to:
  /// **'KSKA'**
  String get appTitle;

  /// No description provided for @navHome.
  ///
  /// In en, this message translates to:
  /// **'Home'**
  String get navHome;

  /// No description provided for @navVotes.
  ///
  /// In en, this message translates to:
  /// **'Votes'**
  String get navVotes;

  /// No description provided for @navTickets.
  ///
  /// In en, this message translates to:
  /// **'Tickets'**
  String get navTickets;

  /// No description provided for @navLeaderboard.
  ///
  /// In en, this message translates to:
  /// **'Ranks'**
  String get navLeaderboard;

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

  /// No description provided for @authSignup.
  ///
  /// In en, this message translates to:
  /// **'Sign Up'**
  String get authSignup;

  /// No description provided for @authLogout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get authLogout;

  /// No description provided for @authEmail.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get authEmail;

  /// No description provided for @authPassword.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get authPassword;

  /// No description provided for @authConfirmPassword.
  ///
  /// In en, this message translates to:
  /// **'Confirm Password'**
  String get authConfirmPassword;

  /// No description provided for @authFullName.
  ///
  /// In en, this message translates to:
  /// **'Full Name'**
  String get authFullName;

  /// No description provided for @authUsername.
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get authUsername;

  /// No description provided for @authPhone.
  ///
  /// In en, this message translates to:
  /// **'Phone'**
  String get authPhone;

  /// No description provided for @authForgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get authForgotPassword;

  /// No description provided for @authResetPassword.
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get authResetPassword;

  /// No description provided for @authOr.
  ///
  /// In en, this message translates to:
  /// **'or'**
  String get authOr;

  /// No description provided for @authContinueWithGoogle.
  ///
  /// In en, this message translates to:
  /// **'Continue with Google'**
  String get authContinueWithGoogle;

  /// No description provided for @authNoAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account?'**
  String get authNoAccount;

  /// No description provided for @authHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Already have an account?'**
  String get authHaveAccount;

  /// No description provided for @authVerificationCode.
  ///
  /// In en, this message translates to:
  /// **'Verification Code'**
  String get authVerificationCode;

  /// No description provided for @profileEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit Profile'**
  String get profileEdit;

  /// No description provided for @profileSettings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get profileSettings;

  /// No description provided for @profileLanguage.
  ///
  /// In en, this message translates to:
  /// **'Language'**
  String get profileLanguage;

  /// No description provided for @profileNotifications.
  ///
  /// In en, this message translates to:
  /// **'Notifications'**
  String get profileNotifications;

  /// No description provided for @profileMembership.
  ///
  /// In en, this message translates to:
  /// **'Membership Plans'**
  String get profileMembership;

  /// No description provided for @profileHelp.
  ///
  /// In en, this message translates to:
  /// **'Help & Support'**
  String get profileHelp;

  /// No description provided for @profileAbout.
  ///
  /// In en, this message translates to:
  /// **'About'**
  String get profileAbout;

  /// No description provided for @homeFeed.
  ///
  /// In en, this message translates to:
  /// **'Feed'**
  String get homeFeed;

  /// No description provided for @homeCreatePost.
  ///
  /// In en, this message translates to:
  /// **'Create Post'**
  String get homeCreatePost;

  /// No description provided for @homeTrending.
  ///
  /// In en, this message translates to:
  /// **'Trending'**
  String get homeTrending;

  /// No description provided for @homeLatest.
  ///
  /// In en, this message translates to:
  /// **'Latest'**
  String get homeLatest;

  /// No description provided for @homeNoPosts.
  ///
  /// In en, this message translates to:
  /// **'No posts yet. Be the first!'**
  String get homeNoPosts;

  /// No description provided for @homePullToRefresh.
  ///
  /// In en, this message translates to:
  /// **'Pull to refresh'**
  String get homePullToRefresh;

  /// No description provided for @postLike.
  ///
  /// In en, this message translates to:
  /// **'Like'**
  String get postLike;

  /// No description provided for @postComment.
  ///
  /// In en, this message translates to:
  /// **'Comment'**
  String get postComment;

  /// No description provided for @postShare.
  ///
  /// In en, this message translates to:
  /// **'Share'**
  String get postShare;

  /// No description provided for @postSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get postSave;

  /// No description provided for @postReport.
  ///
  /// In en, this message translates to:
  /// **'Report'**
  String get postReport;

  /// No description provided for @postLikes.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =0{No likes} =1{1 like} other{{count} likes}}'**
  String postLikes(int count);

  /// No description provided for @postCommentsCount.
  ///
  /// In en, this message translates to:
  /// **'{count, plural, =0{No comments} =1{1 comment} other{{count} comments}}'**
  String postCommentsCount(int count);

  /// No description provided for @voteNow.
  ///
  /// In en, this message translates to:
  /// **'Vote Now'**
  String get voteNow;

  /// No description provided for @voteEnded.
  ///
  /// In en, this message translates to:
  /// **'Ended'**
  String get voteEnded;

  /// No description provided for @voteLive.
  ///
  /// In en, this message translates to:
  /// **'Live'**
  String get voteLive;

  /// No description provided for @voteUpcoming.
  ///
  /// In en, this message translates to:
  /// **'Upcoming'**
  String get voteUpcoming;

  /// No description provided for @voteTotalVotes.
  ///
  /// In en, this message translates to:
  /// **'{count} votes'**
  String voteTotalVotes(int count);

  /// No description provided for @voteAlreadyVoted.
  ///
  /// In en, this message translates to:
  /// **'You have already voted'**
  String get voteAlreadyVoted;

  /// No description provided for @voteConfirmTitle.
  ///
  /// In en, this message translates to:
  /// **'Confirm Vote'**
  String get voteConfirmTitle;

  /// No description provided for @voteConfirmMessage.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to vote for \"{option}\"?'**
  String voteConfirmMessage(String option);

  /// No description provided for @ticketBuyNow.
  ///
  /// In en, this message translates to:
  /// **'Buy Ticket'**
  String get ticketBuyNow;

  /// No description provided for @ticketFree.
  ///
  /// In en, this message translates to:
  /// **'Free'**
  String get ticketFree;

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

  /// No description provided for @ticketQuantityLeft.
  ///
  /// In en, this message translates to:
  /// **'{count} left'**
  String ticketQuantityLeft(int count);

  /// No description provided for @ticketSoldOut.
  ///
  /// In en, this message translates to:
  /// **'Sold Out'**
  String get ticketSoldOut;

  /// No description provided for @ticketMyTickets.
  ///
  /// In en, this message translates to:
  /// **'My Tickets'**
  String get ticketMyTickets;

  /// No description provided for @ticketConfirmed.
  ///
  /// In en, this message translates to:
  /// **'Confirmed'**
  String get ticketConfirmed;

  /// No description provided for @payManual.
  ///
  /// In en, this message translates to:
  /// **'Pay Manually'**
  String get payManual;

  /// No description provided for @payBankInfo.
  ///
  /// In en, this message translates to:
  /// **'Bank Account Information'**
  String get payBankInfo;

  /// No description provided for @payUploadReceipt.
  ///
  /// In en, this message translates to:
  /// **'Upload Receipt'**
  String get payUploadReceipt;

  /// No description provided for @paySenderName.
  ///
  /// In en, this message translates to:
  /// **'Sender Name'**
  String get paySenderName;

  /// No description provided for @payTransactionRef.
  ///
  /// In en, this message translates to:
  /// **'Transaction Reference'**
  String get payTransactionRef;

  /// No description provided for @paySubmitReceipt.
  ///
  /// In en, this message translates to:
  /// **'Submit Receipt'**
  String get paySubmitReceipt;

  /// No description provided for @paySubmitted.
  ///
  /// In en, this message translates to:
  /// **'Receipt submitted! Awaiting admin review.'**
  String get paySubmitted;

  /// No description provided for @payProcessingTime.
  ///
  /// In en, this message translates to:
  /// **'Review takes up to 24 hours.'**
  String get payProcessingTime;

  /// No description provided for @errorGeneric.
  ///
  /// In en, this message translates to:
  /// **'Something went wrong. Please try again.'**
  String get errorGeneric;

  /// No description provided for @errorNetwork.
  ///
  /// In en, this message translates to:
  /// **'No internet connection'**
  String get errorNetwork;

  /// No description provided for @errorInvalidCredentials.
  ///
  /// In en, this message translates to:
  /// **'Invalid email or password'**
  String get errorInvalidCredentials;

  /// No description provided for @errorEmailExists.
  ///
  /// In en, this message translates to:
  /// **'Email already registered'**
  String get errorEmailExists;

  /// No description provided for @errorUsernameExists.
  ///
  /// In en, this message translates to:
  /// **'Username already taken'**
  String get errorUsernameExists;

  /// No description provided for @errorPasswordMismatch.
  ///
  /// In en, this message translates to:
  /// **'Passwords do not match'**
  String get errorPasswordMismatch;

  /// No description provided for @errorPasswordTooShort.
  ///
  /// In en, this message translates to:
  /// **'Password must be at least 8 characters'**
  String get errorPasswordTooShort;

  /// No description provided for @successSaved.
  ///
  /// In en, this message translates to:
  /// **'Saved successfully'**
  String get successSaved;

  /// No description provided for @successUpdated.
  ///
  /// In en, this message translates to:
  /// **'Updated successfully'**
  String get successUpdated;

  /// No description provided for @successDeleted.
  ///
  /// In en, this message translates to:
  /// **'Deleted successfully'**
  String get successDeleted;

  /// No description provided for @commonLoading.
  ///
  /// In en, this message translates to:
  /// **'Loading...'**
  String get commonLoading;

  /// No description provided for @commonRetry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get commonRetry;

  /// No description provided for @commonCancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get commonCancel;

  /// No description provided for @commonConfirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get commonConfirm;

  /// No description provided for @commonSave.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get commonSave;

  /// No description provided for @commonDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete'**
  String get commonDelete;

  /// No description provided for @commonEdit.
  ///
  /// In en, this message translates to:
  /// **'Edit'**
  String get commonEdit;

  /// No description provided for @commonSubmit.
  ///
  /// In en, this message translates to:
  /// **'Submit'**
  String get commonSubmit;

  /// No description provided for @commonBack.
  ///
  /// In en, this message translates to:
  /// **'Back'**
  String get commonBack;

  /// No description provided for @commonNext.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get commonNext;

  /// No description provided for @commonDone.
  ///
  /// In en, this message translates to:
  /// **'Done'**
  String get commonDone;

  /// No description provided for @commonYes.
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get commonYes;

  /// No description provided for @commonNo.
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get commonNo;
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

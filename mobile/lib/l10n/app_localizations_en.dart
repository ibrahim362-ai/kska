// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'KSKA';

  @override
  String get navHome => 'Home';

  @override
  String get navVotes => 'Votes';

  @override
  String get navTickets => 'Tickets';

  @override
  String get navLeaderboard => 'Ranks';

  @override
  String get navProfile => 'Profile';

  @override
  String get authLogin => 'Sign In';

  @override
  String get authSignup => 'Sign Up';

  @override
  String get authLogout => 'Logout';

  @override
  String get authEmail => 'Email';

  @override
  String get authPassword => 'Password';

  @override
  String get authConfirmPassword => 'Confirm Password';

  @override
  String get authFullName => 'Full Name';

  @override
  String get authUsername => 'Username';

  @override
  String get authPhone => 'Phone';

  @override
  String get authForgotPassword => 'Forgot Password?';

  @override
  String get authResetPassword => 'Reset Password';

  @override
  String get authOr => 'or';

  @override
  String get authContinueWithGoogle => 'Continue with Google';

  @override
  String get authNoAccount => 'Don\'t have an account?';

  @override
  String get authHaveAccount => 'Already have an account?';

  @override
  String get authVerificationCode => 'Verification Code';

  @override
  String get profileEdit => 'Edit Profile';

  @override
  String get profileSettings => 'Settings';

  @override
  String get profileLanguage => 'Language';

  @override
  String get profileNotifications => 'Notifications';

  @override
  String get profileMembership => 'Membership Plans';

  @override
  String get profileHelp => 'Help & Support';

  @override
  String get profileAbout => 'About';

  @override
  String get homeFeed => 'Feed';

  @override
  String get homeCreatePost => 'Create Post';

  @override
  String get homeTrending => 'Trending';

  @override
  String get homeLatest => 'Latest';

  @override
  String get homeNoPosts => 'No posts yet. Be the first!';

  @override
  String get homePullToRefresh => 'Pull to refresh';

  @override
  String get postLike => 'Like';

  @override
  String get postComment => 'Comment';

  @override
  String get postShare => 'Share';

  @override
  String get postSave => 'Save';

  @override
  String get postReport => 'Report';

  @override
  String postLikes(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count likes',
      one: '1 like',
      zero: 'No likes',
    );
    return '$_temp0';
  }

  @override
  String postCommentsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count comments',
      one: '1 comment',
      zero: 'No comments',
    );
    return '$_temp0';
  }

  @override
  String get voteNow => 'Vote Now';

  @override
  String get voteEnded => 'Ended';

  @override
  String get voteLive => 'Live';

  @override
  String get voteUpcoming => 'Upcoming';

  @override
  String voteTotalVotes(int count) {
    return '$count votes';
  }

  @override
  String get voteAlreadyVoted => 'You have already voted';

  @override
  String get voteConfirmTitle => 'Confirm Vote';

  @override
  String voteConfirmMessage(String option) {
    return 'Are you sure you want to vote for \"$option\"?';
  }

  @override
  String get ticketBuyNow => 'Buy Ticket';

  @override
  String get ticketFree => 'Free';

  @override
  String get ticketEventDate => 'Event Date';

  @override
  String get ticketLocation => 'Location';

  @override
  String ticketQuantityLeft(int count) {
    return '$count left';
  }

  @override
  String get ticketSoldOut => 'Sold Out';

  @override
  String get ticketMyTickets => 'My Tickets';

  @override
  String get ticketConfirmed => 'Confirmed';

  @override
  String get payManual => 'Pay Manually';

  @override
  String get payBankInfo => 'Bank Account Information';

  @override
  String get payUploadReceipt => 'Upload Receipt';

  @override
  String get paySenderName => 'Sender Name';

  @override
  String get payTransactionRef => 'Transaction Reference';

  @override
  String get paySubmitReceipt => 'Submit Receipt';

  @override
  String get paySubmitted => 'Receipt submitted! Awaiting admin review.';

  @override
  String get payProcessingTime => 'Review takes up to 24 hours.';

  @override
  String get errorGeneric => 'Something went wrong. Please try again.';

  @override
  String get errorNetwork => 'No internet connection';

  @override
  String get errorInvalidCredentials => 'Invalid email or password';

  @override
  String get errorEmailExists => 'Email already registered';

  @override
  String get errorUsernameExists => 'Username already taken';

  @override
  String get errorPasswordMismatch => 'Passwords do not match';

  @override
  String get errorPasswordTooShort => 'Password must be at least 8 characters';

  @override
  String get successSaved => 'Saved successfully';

  @override
  String get successUpdated => 'Updated successfully';

  @override
  String get successDeleted => 'Deleted successfully';

  @override
  String get commonLoading => 'Loading...';

  @override
  String get commonRetry => 'Retry';

  @override
  String get commonCancel => 'Cancel';

  @override
  String get commonConfirm => 'Confirm';

  @override
  String get commonSave => 'Save';

  @override
  String get commonDelete => 'Delete';

  @override
  String get commonEdit => 'Edit';

  @override
  String get commonSubmit => 'Submit';

  @override
  String get commonBack => 'Back';

  @override
  String get commonNext => 'Next';

  @override
  String get commonDone => 'Done';

  @override
  String get commonYes => 'Yes';

  @override
  String get commonNo => 'No';
}

// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Amharic (`am`).
class AppLocalizationsAm extends AppLocalizations {
  AppLocalizationsAm([String locale = 'am']) : super(locale);

  @override
  String get appTitle => 'የማህበረሰብ ማዕከል';

  @override
  String get navHome => 'መነሻ';

  @override
  String get navVotes => 'ድምፅ';

  @override
  String get navTickets => 'ቲኬቶች';

  @override
  String get navLeaderboard => 'ደረጃ';

  @override
  String get navProfile => 'መገለጫ';

  @override
  String get authLogin => 'ግባ';

  @override
  String get authSignup => 'ተመዝገብ';

  @override
  String get authLogout => 'ውጣ';

  @override
  String get authEmail => 'ኢሜይል';

  @override
  String get authPassword => 'የይለፍ ቃል';

  @override
  String get authConfirmPassword => 'የይለፍ ቃል ደግም';

  @override
  String get authFullName => 'ሙሉ ስም';

  @override
  String get authUsername => 'የተጠቃሚ ስም';

  @override
  String get authPhone => 'ስልክ';

  @override
  String get authForgotPassword => 'የይለፍ ቃልህን ረሳክተኛል?';

  @override
  String get authResetPassword => 'የይለፍ ቃል ዳግም አዘጋጅ';

  @override
  String get authOr => 'ወይም';

  @override
  String get authContinueWithGoogle => 'በ Google ይቀጥሉ';

  @override
  String get authNoAccount => 'መለያ የለህም?';

  @override
  String get authHaveAccount => 'መለያ አለህ?';

  @override
  String get authVerificationCode => 'የማረጋገጫ ኮድ';

  @override
  String get profileEdit => 'መገለጫ አስተካክል';

  @override
  String get profileSettings => 'ቅንብሮች';

  @override
  String get profileLanguage => 'ቋንቋ';

  @override
  String get profileNotifications => 'ማስታወቂያዎች';

  @override
  String get profileMembership => 'የአባልነት ዕቅዶች';

  @override
  String get profileHelp => 'እርዳታ እና ድጋፍ';

  @override
  String get profileAbout => 'ስለ';

  @override
  String get homeFeed => 'ፊድ';

  @override
  String get homeCreatePost => 'ልጥፍ ፍጠር';

  @override
  String get homeTrending => 'ተወዳጅ';

  @override
  String get homeLatest => 'አዲስ';

  @override
  String get homeNoPosts => 'እስከ አሁን ምንም ልጥፎች የሉም። የመጀመሪያው ሁን!';

  @override
  String get homePullToRefresh => 'ለማደስ ይጎትቱ';

  @override
  String get postLike => 'ወደው';

  @override
  String get postComment => 'አስተያየት';

  @override
  String get postShare => 'አጋራ';

  @override
  String get postSave => 'አስቀምጥ';

  @override
  String get postReport => 'ሪፖርት';

  @override
  String postLikes(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count ወደዋል',
      one: '1 ወደዋል',
      zero: 'ምንም ወደዋል',
    );
    return '$_temp0';
  }

  @override
  String postCommentsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count አስተያየቶች',
      one: '1 አስተያየት',
      zero: 'ምንም አስተያየት',
    );
    return '$_temp0';
  }

  @override
  String get voteNow => 'አሁን ድምፅ ስጥ';

  @override
  String get voteEnded => 'አልቋል';

  @override
  String get voteLive => 'ቀጥታ';

  @override
  String get voteUpcoming => 'መጪ';

  @override
  String voteTotalVotes(int count) {
    return '$count ድምፆች';
  }

  @override
  String get voteAlreadyVoted => 'አስቀድማ ድምፅ ሰጥተናል';

  @override
  String get voteConfirmTitle => 'ድምፅ አረጋግጥ';

  @override
  String voteConfirmMessage(String option) {
    return 'ለ \"$option\" ለመድምፅ እርግጠኛ ነህ?';
  }

  @override
  String get ticketBuyNow => 'ቲኬት ግዛ';

  @override
  String get ticketFree => 'ነጻ';

  @override
  String get ticketEventDate => 'የዝግጅት ቀን';

  @override
  String get ticketLocation => 'ቦታ';

  @override
  String ticketQuantityLeft(int count) {
    return '$count ቀርቷል';
  }

  @override
  String get ticketSoldOut => 'ተሸጧል';

  @override
  String get ticketMyTickets => 'የእኔ ቲኬቶች';

  @override
  String get ticketConfirmed => 'ተረጋግጧል';

  @override
  String get payManual => 'በእጅ ይክፈሉ';

  @override
  String get payBankInfo => 'የባንክ ሂሳብ መረጃ';

  @override
  String get payUploadReceipt => 'ደረሰኝ ስቀል';

  @override
  String get paySenderName => 'የላኪው ስም';

  @override
  String get payTransactionRef => 'የግብይት ቁጥር';

  @override
  String get paySubmitReceipt => 'ደረሰኝ አስገባ';

  @override
  String get paySubmitted => 'ደረሰኝ ገብቷል! አስተዳዳሪ እየገምጸዋል።';

  @override
  String get payProcessingTime => 'ግምገማ እስከ 24 ሰዓት ይወስዳል።';

  @override
  String get errorGeneric => 'የሆነ ስህተት ተፈጥሯል። እባክህ ድገም ሞክር።';

  @override
  String get errorNetwork => 'ምንም የበይነርት ግንኙነት የለም';

  @override
  String get errorInvalidCredentials => 'ልክ ያልሆነ ኢሜይል ወይም የይለፍ ቃል';

  @override
  String get errorEmailExists => 'ኢሜይሉ አስቀድማ ተመዝግቧል';

  @override
  String get errorUsernameExists => 'የተጠቃሚ ስሙ ተይዟል';

  @override
  String get errorPasswordMismatch => 'የይለፍ ቃሎች አይዛመዱም';

  @override
  String get errorPasswordTooShort => 'የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት';

  @override
  String get successSaved => 'በተሳካ ሁኔታ ተቀምጧል';

  @override
  String get successUpdated => 'በተሳካ ሁኔታ ተዘምኗል';

  @override
  String get successDeleted => 'በተሳካ ሁኔታ ተሰርዟል';

  @override
  String get commonLoading => 'በመጫን ላይ...';

  @override
  String get commonRetry => 'እንደገና ሞክር';

  @override
  String get commonCancel => 'ሰርዝ';

  @override
  String get commonConfirm => 'አረጋግጥ';

  @override
  String get commonSave => 'አስቀምጥ';

  @override
  String get commonDelete => 'ሰርዝ';

  @override
  String get commonEdit => 'አስተካክል';

  @override
  String get commonSubmit => 'አስገባ';

  @override
  String get commonBack => 'ተመለስ';

  @override
  String get commonNext => 'ቀጥሎ';

  @override
  String get commonDone => 'ተጠናቋል';

  @override
  String get commonYes => 'አዎ';

  @override
  String get commonNo => 'አይደለም';
}

// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Amharic (`am`).
class AppLocalizationsAm extends AppLocalizations {
  AppLocalizationsAm([String locale = 'am']) : super(locale);

  @override
  String get appTitle => 'የአስራች ፖርታል';

  @override
  String get navDashboard => 'ዳሽቦርድ';

  @override
  String get navTickets => 'ቲኬቶች';

  @override
  String get navScan => 'ስካን';

  @override
  String get navPosts => 'ልጥፎች';

  @override
  String get navProfile => 'መገለጫ';

  @override
  String get authLogin => 'ግባ';

  @override
  String get authUsername => 'የተጠቃሚ ስም';

  @override
  String get authPassword => 'የይለፍ ቃል';

  @override
  String get authSigninFailed => 'መግቢያ አልተሳካም። ምስልን ያረምዱ።';

  @override
  String get authLogout => 'ውጣ';

  @override
  String get authLogoutConfirm => 'ለመውጣት እርግጠኛ ነህ?';

  @override
  String get dashboardOverview => 'አጠቃላይ እይታ';

  @override
  String get dashboardQuickActions => 'ፈጣን ድርጊቶች';

  @override
  String get statTickets => 'ቲኬቶች';

  @override
  String get statCheckins => 'ምዝገባዎች';

  @override
  String get statPosts => 'ልጥፎች';

  @override
  String get statVotes => 'ድምፆች';

  @override
  String get statRevenue => 'ገቢ';

  @override
  String get actionCreateTicket => 'ቲኬት ፍጠር';

  @override
  String get actionCreateTicketSub => 'አዲስ የዝግጅት ቲኬት ይፍጠሩ';

  @override
  String get actionScan => 'QR ኮድ ስካን';

  @override
  String get actionScanSub => 'ተሳታፊዎችን ይመዝገቡ';

  @override
  String get actionCheckins => 'ምዝገባዎችን ይመልከቱ';

  @override
  String get actionCheckinsSub => 'ሁሉም የምዝገባ ታሪክ';

  @override
  String get actionNotifications => 'ማስታወቂያዎች';

  @override
  String get ticketTitle => 'ርዕስ';

  @override
  String get ticketDescription => 'መግለጫ';

  @override
  String get ticketPrice => 'ዋጋ';

  @override
  String get ticketQuantity => 'ብዛት';

  @override
  String get ticketEventDate => 'የዝግጅት ቀን';

  @override
  String get ticketLocation => 'ቦታ';

  @override
  String get ticketCreate => 'ፍጠር';

  @override
  String get ticketFree => 'ነጻ';

  @override
  String ticketSold(int count) {
    return '$count ተሽጧል';
  }

  @override
  String ticketLeft(int count) {
    return '$count ቀርቷል';
  }

  @override
  String get ticketSoldOut => 'ተሸጧል';

  @override
  String get ticketActive => 'ንቁ';

  @override
  String get ticketCancelled => 'ተሰርዟል';

  @override
  String get ticketCompleted => 'ተጠናቋል';

  @override
  String get checkinScanTitle => 'ቲኬት ስካን';

  @override
  String get checkinSuccess => 'ምዝገባ ተሳክቷል!';

  @override
  String get checkinAlreadyCheckedIn => 'አስቀድማ ተመዝግቧል';

  @override
  String get checkinInvalid => 'ልክ ያልሆነ QR ኮድ';

  @override
  String get checkinManualEntry => 'በእጅ ምዝገባ';

  @override
  String get checkinManualHint => 'የግዢ መለያ ወይም የQR ኮድ እሴት አስገባ';

  @override
  String get checkinScanNext => 'ቀጣይ ስካን';

  @override
  String get checkinRecentTitle => 'የምዝገባ ታሪክ';

  @override
  String get checkinEmpty => 'እስከ አሁን ምንም ምዝገባዎች የሉም';

  @override
  String get notificationEmpty => 'ምንም ማስታወቂያዎች የሉም';

  @override
  String get notificationMarkAllRead => 'ሁሉንም እንደተነበበ ምልክት አድርግ';

  @override
  String get language => 'ቋንቋ';

  @override
  String get errorGeneric => 'የሆነ ስህተት ተፈጥሯል';

  @override
  String get commonCancel => 'ሰርዝ';

  @override
  String get commonRetry => 'እንደገና ሞክር';

  @override
  String get commonLoading => 'በመጫን ላይ...';

  @override
  String get commonSave => 'አስቀምጥ';
}

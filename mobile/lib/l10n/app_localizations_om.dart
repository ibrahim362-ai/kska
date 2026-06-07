// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Oromo (`om`).
class AppLocalizationsOm extends AppLocalizations {
  AppLocalizationsOm([String locale = 'om']) : super(locale);

  @override
  String get appTitle => 'Naannoo Hawaasaa';

  @override
  String get navHome => 'Manu';

  @override
  String get navVotes => 'Sagaleewwan';

  @override
  String get navTickets => 'Tikeetiiwwan';

  @override
  String get navLeaderboard => 'Sadarkaa';

  @override
  String get navProfile => 'Profaayilii';

  @override
  String get authLogin => 'Seeni';

  @override
  String get authSignup => 'Galmaa\'i';

  @override
  String get authLogout => 'Ba\'i';

  @override
  String get authEmail => 'Imeelii';

  @override
  String get authPassword => 'Jecha Darbii';

  @override
  String get authConfirmPassword => 'Jecha darbii mirkaneessi';

  @override
  String get authFullName => 'Maqaa Guutuu';

  @override
  String get authUsername => 'Maqaa fayyadamaa';

  @override
  String get authPhone => 'Bilbila';

  @override
  String get authForgotPassword => 'Jecha darbii irraanfactee?';

  @override
  String get authResetPassword => 'Jecha darbii haaraa godhi';

  @override
  String get authOr => 'yookiin';

  @override
  String get authContinueWithGoogle => 'Google waliin itti fufi';

  @override
  String get authNoAccount => 'Akkaawuntii hin qabdu?';

  @override
  String get authHaveAccount => 'Akkaawuntii qabda?';

  @override
  String get authVerificationCode => 'Koodii mirkaneessaa';

  @override
  String get profileEdit => 'Profaayilii gulaali';

  @override
  String get profileSettings => 'Safartuu';

  @override
  String get profileLanguage => 'Afaan';

  @override
  String get profileNotifications => 'Beeksisa';

  @override
  String get profileMembership => 'Pireezii Miseensaa';

  @override
  String get profileHelp => 'Gargaarsa';

  @override
  String get profileAbout => 'Waa\'ee';

  @override
  String get homeFeed => 'Feedii';

  @override
  String get homeCreatePost => 'Poostii uumi';

  @override
  String get homeTrending => 'Olaanoo';

  @override
  String get homeLatest => 'Haaraa';

  @override
  String get homeNoPosts =>
      'Hanga ammaatti poostii hin jiran. Kan jalqabaa ta\'i!';

  @override
  String get homePullToRefresh => 'Haaruumsuuf tarsi';

  @override
  String get postLike => 'Jaalladhu';

  @override
  String get postComment => 'Yaada';

  @override
  String get postShare => 'Qabiyyee';

  @override
  String get postSave => 'Olkaa\'i';

  @override
  String get postReport => 'Gabaasi';

  @override
  String postLikes(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count jaallataman',
      one: '1 jaallatame',
      zero: 'Hin jaallatamne',
    );
    return '$_temp0';
  }

  @override
  String postCommentsCount(int count) {
    String _temp0 = intl.Intl.pluralLogic(
      count,
      locale: localeName,
      other: '$count yaadota',
      one: '1 yaada',
      zero: 'Yaadni hin jiru',
    );
    return '$_temp0';
  }

  @override
  String get voteNow => 'Amma sagaleessi';

  @override
  String get voteEnded => 'Xumureera';

  @override
  String get voteLive => 'Tamsaasa';

  @override
  String get voteUpcoming => 'Dhufu';

  @override
  String voteTotalVotes(int count) {
    return '$count sagaleewwan';
  }

  @override
  String get voteAlreadyVoted => 'Duraan sagalee kenniteetta';

  @override
  String get voteConfirmTitle => 'Sagaleessa mirkaneessi';

  @override
  String voteConfirmMessage(String option) {
    return 'Sagaleessa \"$option\" keessatti sagaleessuuf mirkaneessaadhaa?';
  }

  @override
  String get ticketBuyNow => 'Tikeetii bithi';

  @override
  String get ticketFree => 'Bilisaan';

  @override
  String get ticketEventDate => 'Guyyaa Taarii';

  @override
  String get ticketLocation => 'Bakka';

  @override
  String ticketQuantityLeft(int count) {
    return '$count hafe';
  }

  @override
  String get ticketSoldOut => 'Gurgurameera';

  @override
  String get ticketMyTickets => 'Tikeetii koo';

  @override
  String get ticketConfirmed => 'Mirkanaa\'eera';

  @override
  String get payManual => 'Harkaan kaffali';

  @override
  String get payBankInfo => 'Odeeffannoo Herregaa Baankii';

  @override
  String get payUploadReceipt => 'Rasiitii olkaa\'i';

  @override
  String get paySenderName => 'Maqaa ergaa';

  @override
  String get payTransactionRef => 'Lakkoofsa Daldala';

  @override
  String get paySubmitReceipt => 'Rasiitii galchi';

  @override
  String get paySubmitted =>
      'Rasiitiin galmaa\'e! Administireetirri ilaalaa jira.';

  @override
  String get payProcessingTime => 'Ilaalchi sa\'aatii 24 fudhachuu danda\'a.';

  @override
  String get errorGeneric =>
      'Wanti dogoggora ta\'e jira. Maaloo irra deebi\'i yaali.';

  @override
  String get errorNetwork => 'Walqunnamtii interneetii hin jiru';

  @override
  String get errorInvalidCredentials =>
      'Imeelii yookaan jecha darbii sirrii miti';

  @override
  String get errorEmailExists => 'Imeiliin duraan galmaa\'era';

  @override
  String get errorUsernameExists => 'Maqaan fayyadamaa fudhatameera';

  @override
  String get errorPasswordMismatch => 'Jechoonni darbii wal hin simu';

  @override
  String get errorPasswordTooShort =>
      'Jechi darbii yoo xiqqaate qubee 8 ta\'uu qaba';

  @override
  String get successSaved => 'Miltaa\'ee olkaa\'ameera';

  @override
  String get successUpdated => 'Miltaa\'ee haaromfameera';

  @override
  String get successDeleted => 'Miltaa\'ee haqameera';

  @override
  String get commonLoading => 'Fe\'amaa jira...';

  @override
  String get commonRetry => 'Irra deebi\'i yaali';

  @override
  String get commonCancel => 'Dhiisi';

  @override
  String get commonConfirm => 'Mirkaneessi';

  @override
  String get commonSave => 'Olkaa\'i';

  @override
  String get commonDelete => 'Haqi';

  @override
  String get commonEdit => 'Gulaali';

  @override
  String get commonSubmit => 'Galchi';

  @override
  String get commonBack => 'Deebi\'i';

  @override
  String get commonNext => 'Itti fufi';

  @override
  String get commonDone => 'Xumureera';

  @override
  String get commonYes => 'Eeyyee';

  @override
  String get commonNo => 'Lakki';
}

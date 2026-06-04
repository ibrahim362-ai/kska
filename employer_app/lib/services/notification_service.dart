import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'api_service.dart';

@pragma('vm:entry-point')
Future<void> _firebaseBackgroundHandler(RemoteMessage message) async {
  if (kDebugMode) print('Background message: ${message.messageId}');
}

class NotificationService {
  static final NotificationService _instance = NotificationService._();
  factory NotificationService() => _instance;
  NotificationService._();

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _local = FlutterLocalNotificationsPlugin();

  String? _fcmToken;
  String? get fcmToken => _fcmToken;
  bool _initialized = false;
  bool get isInitialized => _initialized;

  Stream<RemoteMessage> get onMessage => FirebaseMessaging.onMessage;
  Stream<RemoteMessage> get onMessageOpenedApp => FirebaseMessaging.onMessageOpenedApp;

  Future<void> initialize() async {
    if (_initialized) return;
    try {
      await Firebase.initializeApp();
      FirebaseMessaging.onBackgroundMessage(_firebaseBackgroundHandler);
      await _requestPermissions();
      _fcmToken = await _fcm.getToken();
      if (kDebugMode) print('FCM Token: $_fcmToken');

      const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
      const iosInit = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );
      await _local.initialize(
        const InitializationSettings(android: androidInit, iOS: iosInit),
      );

      _fcm.onTokenRefresh.listen((t) {
        _fcmToken = t;
        _registerTokenWithBackend(t);
      });

      _initialized = true;
    } catch (e) {
      if (kDebugMode) print('NotificationService init failed: $e');
    }
  }

  Future<bool> _requestPermissions() async {
    final settings = await _fcm.requestPermission(alert: true, badge: true, sound: true);
    if (defaultTargetPlatform == TargetPlatform.android) {
      await Permission.notification.request();
    }
    return settings.authorizationStatus == AuthorizationStatus.authorized;
  }

  Future<void> registerTokenWithBackend(ApiService api) async {
    if (_fcmToken == null) return;
    await _registerTokenWithBackend(_fcmToken!, api: api);
  }

  Future<void> _registerTokenWithBackend(String token, {ApiService? api}) async {
    try {
      final service = api ?? ApiService();
      await service.dio.post('/users/fcm-token', data: {'token': token});
    } catch (e) {
      if (kDebugMode) print('Failed to register FCM token: $e');
    }
  }

  Future<void> unregisterToken(ApiService api) async {
    if (_fcmToken == null) return;
    try {
      await api.dio.delete('/users/fcm-token', data: {'token': _fcmToken});
    } catch (_) {}
  }

  Future<void> showLocal({required String title, required String body, String? payload}) async {
    const details = NotificationDetails(
      android: AndroidNotificationDetails('employer_default', 'Employer', importance: Importance.high, priority: Priority.high),
      iOS: DarwinNotificationDetails(),
    );
    await _local.show(DateTime.now().millisecondsSinceEpoch ~/ 1000, title, body, details, payload: payload);
  }
}

final notificationService = NotificationService();

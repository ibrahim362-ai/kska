import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'api_service.dart';

/// Global background handler. Must be a top-level function.
@pragma('vm:entry-point')
Future<void> _firebaseBackgroundHandler(RemoteMessage message) async {
  if (kDebugMode) {
    print('Background message: ${message.messageId}');
  }
}

class NotificationService {
  static final NotificationService _instance = NotificationService._();
  factory NotificationService() => _instance;
  NotificationService._();

  final FlutterLocalNotificationsPlugin _local = FlutterLocalNotificationsPlugin();

  String? _fcmToken;
  String? get fcmToken => _fcmToken;

  bool _initialized = false;
  bool get isInitialized => _initialized;

  Stream<RemoteMessage> get onMessage => FirebaseMessaging.onMessage;
  Stream<RemoteMessage> get onMessageOpenedApp => FirebaseMessaging.onMessageOpenedApp;

  /// Initialize Firebase + FCM + local notifications
  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Initialize Firebase — skip silently if not configured (e.g. web without firebase_options)
      await Firebase.initializeApp();

      // Set up background handler (native only)
      if (!kIsWeb) {
        FirebaseMessaging.onBackgroundMessage(_firebaseBackgroundHandler);
      }

      // Request permission (iOS + Android 13+)
      await _requestPermissions();

      // Get FCM token (not available on web without proper Firebase setup)
      try {
        _fcmToken = await FirebaseMessaging.instance.getToken();
        if (kDebugMode) print('FCM Token: $_fcmToken');
      } catch (e) {
        if (kDebugMode) print('FCM token unavailable: $e');
      }

      // Configure local notifications (not supported on web)
      if (!kIsWeb) {
        const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
        const iosInit = DarwinInitializationSettings(
          requestAlertPermission: true,
          requestBadgePermission: true,
          requestSoundPermission: true,
        );
        await _local.initialize(
          const InitializationSettings(android: androidInit, iOS: iosInit),
          onDidReceiveNotificationResponse: (response) {
            if (kDebugMode) print('Local notification tapped: ${response.payload}');
          },
        );
      }

      // Listen for token refresh
      FirebaseMessaging.instance.onTokenRefresh.listen((newToken) {
        _fcmToken = newToken;
        _registerTokenWithBackend(newToken);
      });

      _initialized = true;
    } catch (e) {
      // Firebase not configured or unavailable — non-fatal, skip silently
      if (kDebugMode) print('NotificationService init skipped: $e');
      _initialized = true; // Mark as initialized so we don't retry on every login
    }
  }

  /// Request notification permissions
  Future<bool> _requestPermissions() async {
    try {
      final settings = await FirebaseMessaging.instance.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );

      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        await Permission.notification.request();
      }

      return settings.authorizationStatus == AuthorizationStatus.authorized ||
          settings.authorizationStatus == AuthorizationStatus.provisional;
    } catch (e) {
      if (kDebugMode) print('Permission request failed: $e');
      return false;
    }
  }

  /// Register FCM token with backend (call after login)
  Future<void> registerTokenWithBackend(ApiService api) async {
    if (_fcmToken == null) return;
    await _registerTokenWithBackend(_fcmToken!, api: api);
  }

  Future<void> _registerTokenWithBackend(String token, {ApiService? api}) async {
    try {
      final service = api ?? ApiService();
      await service.dio.post('/users/fcm-token', data: {'token': token});
      if (kDebugMode) print('FCM token registered with backend');
    } catch (e) {
      if (kDebugMode) print('Failed to register FCM token: $e');
    }
  }

  /// Unregister FCM token (call on logout)
  Future<void> unregisterToken(ApiService api) async {
    if (_fcmToken == null) return;
    try {
      await api.dio.delete('/users/fcm-token', data: {'token': _fcmToken});
    } catch (e) {
      if (kDebugMode) print('Failed to unregister FCM token: $e');
    }
  }

  /// Show a local notification
  Future<void> showLocal({
    required String title,
    required String body,
    String? payload,
  }) async {
    if (kIsWeb) return; // Not supported on web
    const androidDetails = AndroidNotificationDetails(
      'kska_default',
      'KSKA',
      channelDescription: 'Notifications from KSKA',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );
    const iosDetails = DarwinNotificationDetails();
    const details = NotificationDetails(android: androidDetails, iOS: iosDetails);

    await _local.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      details,
      payload: payload,
    );
  }

  Future<void> subscribeToTopic(String topic) async {
    try {
      await FirebaseMessaging.instance.subscribeToTopic(topic);
    } catch (e) {
      if (kDebugMode) print('subscribeToTopic failed: $e');
    }
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await FirebaseMessaging.instance.unsubscribeFromTopic(topic);
    } catch (e) {
      if (kDebugMode) print('unsubscribeFromTopic failed: $e');
    }
  }
}

final notificationService = NotificationService();

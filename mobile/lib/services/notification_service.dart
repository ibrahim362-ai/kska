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

  final FirebaseMessaging _fcm = FirebaseMessaging.instance;
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
      // Initialize Firebase
      await Firebase.initializeApp();

      // Set up background handler
      FirebaseMessaging.onBackgroundMessage(_firebaseBackgroundHandler);

      // Request permission (iOS + Android 13+)
      await _requestPermissions();

      // Get FCM token
      _fcmToken = await _fcm.getToken();
      if (kDebugMode) {
        print('FCM Token: $_fcmToken');
      }

      // Configure local notifications
      const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
      const iosInit = DarwinInitializationSettings(
        requestAlertPermission: true,
        requestBadgePermission: true,
        requestSoundPermission: true,
      );
      await _local.initialize(
        const InitializationSettings(android: androidInit, iOS: iosInit),
        onDidReceiveNotificationResponse: (response) {
          // Handle notification tap (foreground)
          if (kDebugMode) {
            print('Local notification tapped: ${response.payload}');
          }
        },
      );

      // Listen for token refresh
      _fcm.onTokenRefresh.listen((newToken) {
        _fcmToken = newToken;
        // Re-register with backend
        _registerTokenWithBackend(newToken);
      });

      _initialized = true;
    } catch (e) {
      if (kDebugMode) {
        print('NotificationService init failed: $e');
      }
    }
  }

  /// Request notification permissions
  Future<bool> _requestPermissions() async {
    // FCM permission
    final settings = await _fcm.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    // Also request via permission_handler for Android 13+
    if (defaultTargetPlatform == TargetPlatform.android) {
      await Permission.notification.request();
    }

    return settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional;
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
      if (kDebugMode) {
        print('FCM token registered with backend');
      }
    } catch (e) {
      if (kDebugMode) {
        print('Failed to register FCM token: $e');
      }
    }
  }

  /// Unregister FCM token (call on logout)
  Future<void> unregisterToken(ApiService api) async {
    if (_fcmToken == null) return;
    try {
      await api.dio.delete('/users/fcm-token', data: {'token': _fcmToken});
    } catch (e) {
      if (kDebugMode) {
        print('Failed to unregister FCM token: $e');
      }
    }
  }

  /// Show a local notification (for testing or when FCM isn't available)
  Future<void> showLocal({
    required String title,
    required String body,
    String? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'community_hub_default',
      'Community Hub',
      channelDescription: 'Notifications from Community Hub',
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

  /// Subscribe to a topic (for broadcast notifications)
  Future<void> subscribeToTopic(String topic) async {
    await _fcm.subscribeToTopic(topic);
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    await _fcm.unsubscribeFromTopic(topic);
  }
}

final notificationService = NotificationService();

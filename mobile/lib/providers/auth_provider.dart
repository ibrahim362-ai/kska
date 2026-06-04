import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/models.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../services/notification_service.dart';

const _storage = FlutterSecureStorage();

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

final authProvider = NotifierProvider<AuthNotifier, User?>(AuthNotifier.new);

class AuthNotifier extends Notifier<User?> {
  ApiService get _api => ref.read(apiServiceProvider);
  SocketService get _socket => ref.read(socketServiceProvider);
  NotificationService get _notif => notificationService;

  @override
  User? build() => null;

  Future<String?> signin(String email, String password) async {
    try {
      final res = await _api.dio.post(
        '/auth/signin',
        data: {'email': email, 'password': password},
      );
      final data = res.data['data'];
      await _api.saveTokens(data['accessToken'], data['refreshToken']);
      state = User.fromJson(data['user']);

      // Connect socket + register FCM token
      await _onAuthenticated(data['user']['id']);

      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['message'] ?? 'Login failed';
      }
      return 'Login failed';
    }
  }

  Future<String?> signup(
    String email,
    String username,
    String password,
    String fullName,
  ) async {
    try {
      final res = await _api.dio.post(
        '/auth/signup',
        data: {
          'email': email,
          'username': username,
          'password': password,
          'fullName': fullName,
        },
      );
      final data = res.data['data'];
      await _api.saveTokens(data['accessToken'], data['refreshToken']);
      state = User.fromJson(data['user']);
      await _onAuthenticated(data['user']['id']);
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['message'] ?? 'Signup failed';
      }
      return 'Signup failed';
    }
  }

  Future<String?> signupWithOtp(
    String email,
    String username,
    String password,
    String fullName,
    String code,
  ) async {
    try {
      final res = await _api.dio.post(
        '/auth/signup',
        data: {
          'email': email,
          'username': username,
          'password': password,
          'fullName': fullName,
          'code': code,
        },
      );
      final data = res.data['data'];
      await _api.saveTokens(data['accessToken'], data['refreshToken']);
      state = User.fromJson(data['user']);
      await _onAuthenticated(data['user']['id']);
      return null;
    } catch (e) {
      if (e is DioException) {
        return e.response?.data?['message'] ?? 'Signup failed';
      }
      return 'Signup failed';
    }
  }

  Future<void> logout() async {
    // Unregister FCM token
    try {
      await _notif.unregisterToken(_api);
    } catch (_) {}

    // Disconnect socket
    _socket.disconnect();

    // Clear tokens
    await _storage.deleteAll();

    state = null;
  }

  Future<void> fetchProfile() async {
    final res = await _api.dio.get('/auth/me');
    state = User.fromJson(res.data['data']);
  }

  /// Called after successful authentication
  Future<void> _onAuthenticated(String userId) async {
    // Get the access token from storage
    final token = await _storage.read(key: 'accessToken');
    if (token != null) {
      _socket.connect(token, userId);
    }

    // Initialize notifications and register FCM token
    await _notif.initialize();
    await _notif.registerTokenWithBackend(_api);
  }
}

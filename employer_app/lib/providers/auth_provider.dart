import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';
import '../services/socket_service.dart';
import '../services/notification_service.dart';

final apiProvider = Provider<ApiService>((ref) => ApiService());
final socketServiceProvider = Provider<SocketService>((ref) {
  final s = SocketService();
  ref.onDispose(s.disconnect);
  return s;
});

final authProvider = NotifierProvider<AuthNotifier, Map<String, dynamic>?>(AuthNotifier.new);

class AuthNotifier extends Notifier<Map<String, dynamic>?> {
  ApiService get api => ref.read(apiProvider);
  SocketService get socket => ref.read(socketServiceProvider);
  NotificationService get notif => notificationService;

  @override
  Map<String, dynamic>? build() => null;

  bool get isLoggedIn => state != null;

  Future<String?> login(String username, String password) async {
    try {
      print('[AUTH] Attempting login for username: $username');
      final res = await api.dio.post('/auth/signin-username', data: {'username': username, 'password': password});
      print('[AUTH] Login response received: ${res.statusCode}');
      
      final data = res.data['data'];
      print('[AUTH] Saving tokens...');
      await api.saveTokens(data['accessToken'], data['refreshToken']);
      
      print('[AUTH] Setting user state...');
      state = data['user'];

      // Connect socket
      print('[AUTH] Connecting socket...');
      try {
        socket.connect(data['accessToken'], data['user']['id']);
      } catch (e) {
        print('[AUTH WARNING] Socket connection failed: $e');
      }

      // Init notifications - skip if fails (not critical)
      print('[AUTH] Initializing notifications...');
      try {
        await notif.initialize();
        await notif.registerTokenWithBackend(api);
      } catch (e) {
        print('[AUTH WARNING] Notification setup failed (non-critical): $e');
      }

      print('[AUTH] Login successful!');
      return null;
    } catch (e) {
      print('[AUTH ERROR] Login failed: $e');
      if (e.toString().contains('DioException')) {
        return 'Network error. Check your connection.';
      }
      return 'Login failed: ${e.toString()}';
    }
  }

  Future<void> logout() async {
    try {
      await notif.unregisterToken(api);
    } catch (_) {}
    socket.disconnect();
    state = null;
  }
}

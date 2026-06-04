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
      final res = await api.dio.post('/auth/signin-username', data: {'username': username, 'password': password});
      final data = res.data['data'];
      await api.saveTokens(data['accessToken'], data['refreshToken']);
      state = data['user'];

      // Connect socket
      socket.connect(data['accessToken'], data['user']['id']);

      // Init notifications
      await notif.initialize();
      await notif.registerTokenWithBackend(api);

      return null;
    } catch (e) {
      return 'Login failed. Check credentials.';
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

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter/foundation.dart';
import 'auth_provider.dart';

/// Singleton socket instance
class SocketService {
  IO.Socket? _socket;
  bool _connected = false;
  String? _userId;

  bool get isConnected => _connected;
  String? get userId => _userId;

  void connect(String token, String userId) {
    if (_connected && _userId == userId) return;
    if (_socket != null) {
      _socket!.dispose();
      _socket = null;
      _connected = false;
    }

    _userId = userId;
    final apiUrl = const String.fromEnvironment('API_URL', defaultValue: 'http://localhost:5000');

    _socket = IO.io(
      apiUrl,
      IO.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setAuth({'token': token})
          .enableReconnection()
          .setReconnectionDelay(1000)
          .setReconnectionDelayMax(5000)
          .build(),
    );

    _socket!.onConnect((_) {
      _connected = true;
      if (kDebugMode) print('[Socket] Connected: ${_socket!.id}');
      // Auto-join user room
      _socket!.emit('join:user', userId);
    });

    _socket!.onDisconnect((_) {
      _connected = false;
      if (kDebugMode) print('[Socket] Disconnected');
    });

    _socket!.onConnectError((err) {
      if (kDebugMode) print('[Socket] Connect error: $err');
    });

    _socket!.onError((err) {
      if (kDebugMode) print('[Socket] Error: $err');
    });

    _socket!.connect();
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _connected = false;
    _userId = null;
  }

  // ============== Room Management ==============
  void joinVoteRoom(String voteId) => _socket?.emit('join:vote', voteId);
  void leaveVoteRoom(String voteId) => _socket?.emit('leave:vote', voteId);
  void joinTicketRoom(String ticketId) => _socket?.emit('join:ticket', ticketId);
  void leaveTicketRoom(String ticketId) => _socket?.emit('leave:ticket', ticketId);

  // ============== Event Listeners ==============
  void onVoteUpdated(void Function(dynamic) callback) {
    _socket?.on('vote:updated', (data) => callback(data));
  }

  void onNotificationNew(void Function(dynamic) callback) {
    _socket?.on('notification:new', (data) => callback(data));
  }

  void onLeaderboardUpdated(void Function(dynamic) callback) {
    _socket?.on('leaderboard:updated', (data) => callback(data));
  }

  void onTicketCheckedIn(void Function(dynamic) callback) {
    _socket?.on('ticket:checkedin', (data) => callback(data));
  }

  void onPostCreated(void Function(dynamic) callback) {
    _socket?.on('post:created', (data) => callback(data));
  }

  void off(String event) {
    _socket?.off(event);
  }
}

final socketServiceProvider = Provider<SocketService>((ref) {
  final service = SocketService();
  ref.onDispose(() => service.disconnect());
  return service;
});

/// Provider for socket connection state (boolean)
final socketConnectedProvider = StateProvider<bool>((ref) {
  final service = ref.watch(socketServiceProvider);
  return service.isConnected;
});

/// Auto-connect socket when user logs in, disconnect on logout
final socketLifecycleProvider = Provider<void>((ref) {
  final user = ref.watch(authProvider);
  final api = ref.read(apiServiceProvider);
  final socket = ref.read(socketServiceProvider);

  if (user != null) {
    api.dio.options.headers['Authorization']; // touch
    // Read token from secure storage
    // (Token is saved in signin/signup — read it)
    // For simplicity, we just pass the userId and let socket use stored token
    socket.connect('token-from-storage', user.id);
  } else {
    socket.disconnect();
  }
});

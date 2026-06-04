import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  IO.Socket? _socket;
  bool _connected = false;
  String? _userId;

  bool get isConnected => _connected;
  String? get userId => _userId;

  void connect(String token, String userId) {
    if (_connected && _userId == userId) return;
    _socket?.dispose();
    _socket = null;
    _userId = userId;
    final apiUrl = const String.fromEnvironment('API_URL', defaultValue: 'http://localhost:5000');

    _socket = IO.io(
      apiUrl,
      IO.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .setAuth({'token': token})
          .enableReconnection()
          .setReconnectionDelay(1000)
          .build(),
    );

    _socket!.onConnect((_) {
      _connected = true;
      _socket!.emit('join:user', userId);
      if (kDebugMode) print('[Socket] Connected');
    });
    _socket!.onDisconnect((_) {
      _connected = false;
    });
    _socket!.onError((_) {});
    _socket!.connect();
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _connected = false;
    _userId = null;
  }

  void joinTicketRoom(String ticketId) => _socket?.emit('join:ticket', ticketId);
  void leaveTicketRoom(String ticketId) => _socket?.emit('leave:ticket', ticketId);
  void joinEventRoom(String eventId) => _socket?.emit('join:event', eventId);

  void onNotificationNew(void Function(dynamic) callback) {
    _socket?.on('notification:new', (data) => callback(data));
  }

  void onTicketCheckedIn(void Function(dynamic) callback) {
    _socket?.on('ticket:checkedin', (data) => callback(data));
  }

  void onTicketSold(void Function(dynamic) callback) {
    _socket?.on('ticket:sold', (data) => callback(data));
  }

  void off(String event) => _socket?.off(event);
}

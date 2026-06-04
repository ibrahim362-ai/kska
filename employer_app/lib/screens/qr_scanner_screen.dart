import 'package:flutter/material.dart';
import 'qr_scanner_widget_stub.dart'
  if (dart.library.io) 'qr_scanner_widget_mobile.dart';
import '../../providers/auth_provider.dart';
import '../../services/socket_service.dart';

class QrScannerScreen extends ConsumerStatefulWidget {
  const QrScannerScreen({super.key});
  @override
  ConsumerState<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends ConsumerState<QrScannerScreen> {
  final _manualCtrl = TextEditingController();
  String? _result;
  bool _scanned = false;
  bool _isSuccess = true;

  @override
  void initState() {
    super.initState();
    // Listen for self-scan confirmations via socket
    final socket = ref.read(socketServiceProvider);
    socket.onTicketCheckedIn((data) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✓ ${data['userName'] ?? 'Someone'} checked in'),
            duration: const Duration(seconds: 2),
            backgroundColor: Colors.green,
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _manualCtrl.dispose();
    super.dispose();
  }

  Future<void> _processQr(String code) async {
    final match = RegExp(r'purchase:(\w+)').firstMatch(code);
    if (match == null) {
      setState(() {
        _result = 'Invalid QR: Not a valid ticket';
        _isSuccess = false;
      });
      return;
    }
    final id = match.group(1)!;
    try {
      final api = ref.read(apiProvider);
      final res = await api.dio.post('/tickets/check-in', data: {'purchaseId': id});
      setState(() {
        _result = res.data['message'] ?? 'Check-in successful!';
        _isSuccess = true;
      });
    } catch (e) {
      String msg = 'Check-in failed';
      if (e is dynamic && e.toString().contains('already')) {
        msg = 'Already checked in';
      } else if (e is dynamic && e.toString().contains('404')) {
        msg = 'Ticket not found';
      }
      setState(() {
        _result = msg;
        _isSuccess = false;
      });
    }
  }

  void _onScanResult(String code) {
    setState(() {
      _scanned = true;
      _result = 'Processing...';
      _isSuccess = true;
    });
    _processQr(code);
  }

  void _manualCheckIn() {
    final text = _manualCtrl.text.trim();
    if (text.isEmpty) return;
    _onScanResult(text);
    _manualCtrl.clear();
  }

  void _reset() => setState(() {
        _scanned = false;
        _result = null;
        _isSuccess = true;
      });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scan Ticket')),
      body: QrScannerWidget(
        onScan: _onScanResult,
        manualCtrl: _manualCtrl,
        manualCheckIn: _manualCheckIn,
        scanned: _scanned,
        result: _result,
        onReset: _reset,
        isSuccess: _isSuccess,
      ),
    );
  }
}

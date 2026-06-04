import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart' as ms;
import 'package:permission_handler/permission_handler.dart';

class QrScannerWidget extends StatefulWidget {
  final Function(String) onScan;
  final TextEditingController manualCtrl;
  final VoidCallback manualCheckIn;
  final bool scanned;
  final String? result;
  final VoidCallback onReset;
  final bool isSuccess;

  const QrScannerWidget({
    super.key,
    required this.onScan,
    required this.manualCtrl,
    required this.manualCheckIn,
    required this.scanned,
    required this.result,
    required this.onReset,
    this.isSuccess = true,
  });

  @override
  State<QrScannerWidget> createState() => _QrScannerWidgetState();
}

class _QrScannerWidgetState extends State<QrScannerWidget> with WidgetsBindingObserver {
  ms.MobileScannerController? _controller;
  bool _hasPermission = false;
  bool _torchOn = false;
  bool _localScanned = false;
  bool _manualMode = false;
  String? _cameraError;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _initCamera();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _initCamera() async {
    final status = await Permission.camera.request();
    if (!mounted) return;
    setState(() => _hasPermission = status.isGranted);
    if (status.isGranted) {
      try {
        _controller = ms.MobileScannerController(
          detectionSpeed: ms.DetectionSpeed.noDuplicates,
          facing: ms.CameraFacing.back,
        );
      } catch (e) {
        setState(() => _cameraError = e.toString());
      }
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (_controller == null) return;
    if (state == AppLifecycleState.resumed) {
      _controller!.start();
    } else if (state == AppLifecycleState.paused) {
      _controller!.stop();
    }
  }

  void _onDetect(ms.BarcodeCapture capture) {
    if (_localScanned || widget.scanned) return;
    for (final barcode in capture.barcodes) {
      final code = barcode.rawValue;
      if (code == null) continue;
      _localScanned = true;
      widget.onScan(code);
      break;
    }
  }

  void _toggleTorch() async {
    if (_controller == null) return;
    await _controller!.toggleTorch();
    if (mounted) setState(() => _torchOn = !_torchOn);
  }

  void _switchCamera() async {
    if (_controller == null) return;
    await _controller!.switchCamera();
  }

  @override
  Widget build(BuildContext context) {
    if (_manualMode) return _buildManualEntry();
    if (!_hasPermission) return _buildPermissionPrompt();
    if (_cameraError != null) return _buildCameraError();

    return Column(
      children: [
        Expanded(
          child: Stack(
            children: [
              ms.MobileScanner(
                controller: _controller!,
                onDetect: _onDetect,
                errorBuilder: (context, error) => _buildCameraError(),
              ),
              // Custom overlay
              Center(
                child: Container(
                  width: 280,
                  height: 280,
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.teal, width: 3),
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
              // Top corner labels
              Positioned(
                top: 16,
                left: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Colors.greenAccent,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Text(
                        'Live',
                        style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ),
              // Result overlay
              if (widget.scanned) Positioned.fill(child: _buildResultOverlay()),
            ],
          ),
        ),
        // Bottom controls
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.white,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _controlButton(
                icon: _torchOn ? Icons.flash_on : Icons.flash_off,
                label: 'Torch',
                onTap: _toggleTorch,
              ),
              _controlButton(
                icon: Icons.cameraswitch,
                label: 'Flip',
                onTap: _switchCamera,
              ),
              _controlButton(
                icon: Icons.keyboard,
                label: 'Manual',
                onTap: () => setState(() => _manualMode = true),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _controlButton({required IconData icon, required String label, required VoidCallback onTap}) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          icon: Icon(icon),
          onPressed: onTap,
          iconSize: 28,
        ),
        Text(label, style: const TextStyle(fontSize: 11)),
      ],
    );
  }

  Widget _buildResultOverlay() {
    final isSuccess = widget.isSuccess;
    return Container(
      color: Colors.black87,
      child: Center(
        child: Card(
          margin: const EdgeInsets.all(24),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  isSuccess ? Icons.check_circle : Icons.error,
                  color: isSuccess ? Colors.green : Colors.red,
                  size: 64,
                ),
                const SizedBox(height: 12),
                Text(
                  widget.result ?? '',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    TextButton(
                      onPressed: () => setState(() => _manualMode = true),
                      child: const Text('Manual'),
                    ),
                    FilledButton.icon(
                      onPressed: () {
                        _localScanned = false;
                        widget.onReset();
                      },
                      icon: const Icon(Icons.qr_code_scanner),
                      label: const Text('Scan Next'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPermissionPrompt() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.camera_alt_outlined, size: 80, color: Colors.grey),
          const SizedBox(height: 16),
          const Text(
            'Camera Permission Required',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const Text(
            'We need camera access to scan QR codes on tickets.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: _initCamera,
            icon: const Icon(Icons.lock_open),
            label: const Text('Grant Permission'),
          ),
          const SizedBox(height: 12),
          TextButton.icon(
            onPressed: () => setState(() => _manualMode = true),
            icon: const Icon(Icons.keyboard),
            label: const Text('Use Manual Entry'),
          ),
        ],
      ),
    );
  }

  Widget _buildCameraError() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.videocam_off, size: 64, color: Colors.red),
          const SizedBox(height: 12),
          const Text('Camera error', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(
            _cameraError ?? 'Could not access camera',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.grey, fontSize: 12),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _initCamera,
            child: const Text('Retry'),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => setState(() => _manualMode = true),
            child: const Text('Use Manual Entry'),
          ),
        ],
      ),
    );
  }

  Widget _buildManualEntry() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.keyboard_alt, size: 80, color: Colors.teal),
          const SizedBox(height: 16),
          const Text('Manual Check-in', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          const Text('Enter Purchase ID or QR code value to check-in a ticket.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 24),
          TextField(
            controller: widget.manualCtrl,
            maxLines: 3,
            decoration: const InputDecoration(
              labelText: 'QR Code Value / Purchase ID',
              hintText: 'Paste QR content here...',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.qr_code),
            ),
            onSubmitted: (_) => widget.manualCheckIn(),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: FilledButton.icon(
              onPressed: widget.manualCheckIn,
              icon: const Icon(Icons.check_circle),
              label: const Text('Check In'),
            ),
          ),
          const SizedBox(height: 8),
          TextButton.icon(
            onPressed: () => setState(() => _manualMode = false),
            icon: const Icon(Icons.qr_code_scanner),
            label: const Text('Back to Camera'),
          ),
          if (widget.scanned) ...[
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(children: [
                  Text(widget.result ?? '', textAlign: TextAlign.center, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),
                  FilledButton.tonal(onPressed: widget.onReset, child: const Text('Check Another')),
                ]),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

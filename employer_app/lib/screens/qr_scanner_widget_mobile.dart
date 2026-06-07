import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:mobile_scanner/mobile_scanner.dart' as ms;
import 'package:permission_handler/permission_handler.dart';
import '../theme/app_theme.dart';

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
                errorBuilder: (context, error, child) => _buildCameraError(),
              ),
              // Modern scan frame with green accent
              Center(
                child: Container(
                  width: 280,
                  height: 280,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.primaryGreen, width: 4),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryGreen.withOpacity(0.5),
                        blurRadius: 20,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                  child: Stack(
                    children: [
                      // Corner accents
                      Positioned(
                        top: 0,
                        left: 0,
                        child: Container(
                          width: 30,
                          height: 30,
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: const BorderRadius.only(topLeft: Radius.circular(20)),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 0,
                        right: 0,
                        child: Container(
                          width: 30,
                          height: 30,
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: const BorderRadius.only(topRight: Radius.circular(20)),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        left: 0,
                        child: Container(
                          width: 30,
                          height: 30,
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: const BorderRadius.only(bottomLeft: Radius.circular(20)),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          width: 30,
                          height: 30,
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: const BorderRadius.only(bottomRight: Radius.circular(20)),
                          ),
                        ),
                      ),
                    ],
                  ),
                )
                    .animate(onPlay: (controller) => controller.repeat())
                    .shimmer(duration: 2000.ms, color: Colors.white.withOpacity(0.3)),
              ),
              // Live indicator
              Positioned(
                top: 24,
                left: 24,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryGreen.withOpacity(0.4),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 10,
                        height: 10,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                      )
                          .animate(onPlay: (controller) => controller.repeat())
                          .fadeIn(duration: 800.ms)
                          .then()
                          .fadeOut(duration: 800.ms),
                      const SizedBox(width: 8),
                      const Text(
                        'SCANNING',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              // Instruction text
              Positioned(
                bottom: 140,
                left: 0,
                right: 0,
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 32),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Text(
                    'Align QR code within frame',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                )
                    .animate()
                    .fadeIn(delay: 500.ms, duration: 600.ms),
              ),
              // Result overlay
              if (widget.scanned) Positioned.fill(child: _buildResultOverlay()),
            ],
          ),
        ),
        // Modern bottom controls
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 20,
                offset: const Offset(0, -5),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _modernControlButton(
                icon: _torchOn ? Icons.flash_on_rounded : Icons.flash_off_rounded,
                label: 'Flash',
                onTap: _toggleTorch,
                isActive: _torchOn,
              ),
              _modernControlButton(
                icon: Icons.cameraswitch_rounded,
                label: 'Flip',
                onTap: _switchCamera,
              ),
              _modernControlButton(
                icon: Icons.keyboard_rounded,
                label: 'Manual',
                onTap: () => setState(() => _manualMode = true),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _modernControlButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isActive = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          gradient: isActive ? AppTheme.primaryGradient : null,
          color: isActive ? null : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(16),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: AppTheme.primaryGreen.withOpacity(0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 28,
              color: isActive ? Colors.white : AppTheme.darkGreen,
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isActive ? Colors.white : AppTheme.darkGreen,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultOverlay() {
    final isSuccess = widget.isSuccess;
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.black.withOpacity(0.8),
            Colors.black.withOpacity(0.95),
          ],
        ),
      ),
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(32),
          padding: const EdgeInsets.all(32),
          decoration: BoxDecoration(
            gradient: isSuccess ? AppTheme.successGradient : AppTheme.errorGradient,
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: (isSuccess ? AppTheme.primaryGreen : Colors.red).withOpacity(0.5),
                blurRadius: 40,
                spreadRadius: 5,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isSuccess ? Icons.check_circle_rounded : Icons.error_rounded,
                color: Colors.white,
                size: 80,
              )
                  .animate()
                  .scale(duration: 600.ms, curve: Curves.elasticOut),
              
              const SizedBox(height: 24),
              
              Text(
                widget.result ?? '',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              )
                  .animate()
                  .fadeIn(delay: 200.ms, duration: 600.ms),
              
              const SizedBox(height: 32),
              
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => _manualMode = true),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white, width: 2),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text(
                        'Manual',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        _localScanned = false;
                        widget.onReset();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: isSuccess ? AppTheme.darkGreen : Colors.red.shade700,
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.qr_code_scanner_rounded, size: 20),
                          const SizedBox(width: 8),
                          const Text(
                            'Scan Next',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              )
                  .animate()
                  .fadeIn(delay: 400.ms, duration: 600.ms)
                  .slideY(begin: 0.2, end: 0),
            ],
          ),
        )
            .animate()
            .scale(begin: const Offset(0.8, 0.8), end: const Offset(1, 1), duration: 600.ms, curve: Curves.elasticOut),
      ),
    );
  }

  Widget _buildPermissionPrompt() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFF0FDF4), Color(0xFFDCFCE7), Color(0xFFBBF7D0)],
        ),
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppTheme.primaryGreen.withOpacity(0.4),
                      blurRadius: 30,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.camera_alt_rounded,
                  size: 64,
                  color: Colors.white,
                ),
              )
                  .animate()
                  .scale(duration: 600.ms, curve: Curves.elasticOut),
              
              const SizedBox(height: 32),
              
              Text(
                'Camera Permission Required',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.darkGreen,
                ),
              ),
              
              const SizedBox(height: 12),
              
              Text(
                'We need camera access to scan QR codes on tickets.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  color: Colors.grey.shade700,
                  height: 1.5,
                ),
              ),
              
              const SizedBox(height: 40),
              
              SizedBox(
                width: double.infinity,
                height: 60,
                child: Container(
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryGreen.withOpacity(0.4),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: _initCamera,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.lock_open_rounded, color: Colors.white, size: 24),
                        const SizedBox(width: 12),
                        const Text(
                          'Grant Permission',
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              TextButton(
                onPressed: () => setState(() => _manualMode = true),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.keyboard_rounded, color: AppTheme.darkGreen),
                    const SizedBox(width: 8),
                    Text(
                      'Use Manual Entry',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.darkGreen,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCameraError() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFF0FDF4), Color(0xFFDCFCE7), Color(0xFFBBF7D0)],
        ),
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(28),
                decoration: BoxDecoration(
                  gradient: AppTheme.errorGradient,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.red.withOpacity(0.4),
                      blurRadius: 30,
                      spreadRadius: 5,
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.videocam_off_rounded,
                  size: 64,
                  color: Colors.white,
                ),
              )
                  .animate()
                  .shake(duration: 500.ms),
              
              const SizedBox(height: 24),
              
              const Text(
                'Camera Error',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF991B1B),
                ),
              ),
              
              const SizedBox(height: 12),
              
              Text(
                _cameraError ?? 'Could not access camera',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade700,
                  height: 1.5,
                ),
              ),
              
              const SizedBox(height: 32),
              
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _initCamera,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFef4444),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                  child: const Text(
                    'Retry Camera',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              
              const SizedBox(height: 12),
              
              TextButton(
                onPressed: () => setState(() => _manualMode = true),
                child: Text(
                  'Use Manual Entry Instead',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.darkGreen,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildManualEntry() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 40),
          
          Container(
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(28),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryGreen.withOpacity(0.4),
                  blurRadius: 30,
                  spreadRadius: 5,
                  offset: const Offset(0, 15),
                ),
              ],
            ),
            child: const Icon(
              Icons.keyboard_alt_rounded,
              size: 64,
              color: Colors.white,
            ),
          )
              .animate()
              .scale(duration: 600.ms, curve: Curves.elasticOut),
          
          const SizedBox(height: 32),
          
          Text(
            'Manual Check-In',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.darkGreen,
              letterSpacing: -0.5,
            ),
          ),
          
          const SizedBox(height: 12),
          
          Text(
            'Enter Purchase ID or QR code value to check-in a ticket.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 15,
              color: Colors.grey.shade600,
              height: 1.5,
            ),
          ),
          
          const SizedBox(height: 40),
          
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryGreen.withOpacity(0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: TextField(
              controller: widget.manualCtrl,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'QR Code Value / Purchase ID',
                hintText: 'Paste QR content here...',
                prefixIcon: Container(
                  margin: const EdgeInsets.all(14),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    gradient: AppTheme.primaryGradient,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(Icons.qr_code_rounded, color: Colors.white, size: 24),
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: const BorderSide(color: AppTheme.primaryGreen, width: 2.5),
                ),
              ),
              onSubmitted: (_) => widget.manualCheckIn(),
            ),
          ),
          
          const SizedBox(height: 24),
          
          SizedBox(
            width: double.infinity,
            height: 64,
            child: Container(
              decoration: BoxDecoration(
                gradient: AppTheme.primaryGradient,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.primaryGreen.withOpacity(0.5),
                    blurRadius: 30,
                    spreadRadius: 2,
                    offset: const Offset(0, 15),
                  ),
                ],
              ),
              child: ElevatedButton(
                onPressed: widget.manualCheckIn,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle_rounded, color: Colors.white, size: 28),
                    const SizedBox(width: 12),
                    const Text(
                      'Check In',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          TextButton(
            onPressed: () => setState(() => _manualMode = false),
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.qr_code_scanner_rounded, color: AppTheme.darkGreen, size: 24),
                const SizedBox(width: 10),
                Text(
                  'Back to Camera',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.darkGreen,
                  ),
                ),
              ],
            ),
          ),
          
          if (widget.scanned) ...[
            const SizedBox(height: 32),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                gradient: widget.isSuccess ? AppTheme.successGradient : AppTheme.errorGradient,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: (widget.isSuccess ? AppTheme.primaryGreen : Colors.red).withOpacity(0.4),
                    blurRadius: 30,
                    spreadRadius: 3,
                    offset: const Offset(0, 15),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Icon(
                    widget.isSuccess ? Icons.check_circle_rounded : Icons.error_rounded,
                    size: 56,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    widget.result ?? '',
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: widget.onReset,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: widget.isSuccess ? AppTheme.darkGreen : Colors.red.shade700,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.refresh_rounded, size: 22),
                          const SizedBox(width: 10),
                          const Text(
                            'Check Another',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            )
                .animate()
                .fadeIn(duration: 400.ms)
                .scale(begin: const Offset(0.9, 0.9), curve: Curves.elasticOut),
          ],
        ],
      ),
    );
  }
}

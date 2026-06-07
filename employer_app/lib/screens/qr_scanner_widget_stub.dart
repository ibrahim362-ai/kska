import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/app_theme.dart';

class QrScannerWidget extends StatelessWidget {
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
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          // Animated QR Icon
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(30),
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
              Icons.qr_code_scanner_rounded,
              size: 80,
              color: Colors.white,
            ),
          )
              .animate(onPlay: (controller) => controller.repeat())
              .fadeIn(duration: 600.ms)
              .then()
              .shimmer(duration: 2000.ms, color: Colors.white.withOpacity(0.3)),
          
          const SizedBox(height: 32),
          
          // Title
          Text(
            'Manual Check-In',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.darkGreen,
              letterSpacing: -0.5,
            ),
          )
              .animate()
              .fadeIn(delay: 200.ms, duration: 600.ms),
          
          const SizedBox(height: 12),
          
          // Subtitle
          Text(
            'Enter Purchase ID or QR code value to check-in a ticket.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 15,
              color: Colors.grey.shade600,
              height: 1.5,
            ),
          )
              .animate()
              .fadeIn(delay: 400.ms, duration: 600.ms),
          
          const SizedBox(height: 40),
          
          // Input Field with Modern Design
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
              controller: manualCtrl,
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
              maxLines: 3,
              onSubmitted: (_) => manualCheckIn(),
            ),
          )
              .animate()
              .fadeIn(delay: 600.ms, duration: 600.ms)
              .slideY(begin: 0.2, end: 0),
          
          const SizedBox(height: 24),
          
          // Check In Button with Gradient
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
                onPressed: manualCheckIn,
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
          )
              .animate()
              .fadeIn(delay: 800.ms, duration: 600.ms)
              .slideY(begin: 0.2, end: 0),
          
          // Result Card
          if (scanned) ...[
            const SizedBox(height: 32),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                gradient: isSuccess
                    ? AppTheme.successGradient
                    : AppTheme.errorGradient,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: (isSuccess ? AppTheme.primaryGreen : Colors.red).withOpacity(0.4),
                    blurRadius: 30,
                    spreadRadius: 3,
                    offset: const Offset(0, 15),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Icon(
                    isSuccess ? Icons.check_circle_rounded : Icons.error_rounded,
                    size: 64,
                    color: Colors.white,
                  )
                      .animate()
                      .scale(duration: 600.ms, curve: Curves.elasticOut),
                  
                  const SizedBox(height: 20),
                  
                  Text(
                    result ?? '',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  )
                      .animate()
                      .fadeIn(delay: 200.ms, duration: 600.ms),
                  
                  const SizedBox(height: 24),
                  
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: onReset,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: isSuccess ? AppTheme.darkGreen : Colors.red.shade700,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(18),
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.refresh_rounded, size: 24),
                          const SizedBox(width: 12),
                          const Text(
                            'Check Another',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                      .animate()
                      .fadeIn(delay: 400.ms, duration: 600.ms)
                      .slideY(begin: 0.2, end: 0),
                ],
              ),
            )
                .animate()
                .fadeIn(duration: 400.ms)
                .scale(begin: const Offset(0.8, 0.8), end: const Offset(1, 1), curve: Curves.elasticOut),
          ],
        ],
      ),
    );
  }
}

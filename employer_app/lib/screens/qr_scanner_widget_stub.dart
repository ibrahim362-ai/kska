import 'package:flutter/material.dart';

class QrScannerWidget extends StatelessWidget {
  final Function(String) onScan;
  final TextEditingController manualCtrl;
  final VoidCallback manualCheckIn;
  final bool scanned;
  final String? result;
  final VoidCallback onReset;

  const QrScannerWidget({
    super.key,
    required this.onScan,
    required this.manualCtrl,
    required this.manualCheckIn,
    required this.scanned,
    required this.result,
    required this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(children: [
        const Icon(Icons.qr_code_scanner, size: 80, color: Colors.teal),
        const SizedBox(height: 16),
        const Text('Manual Check-in', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        const Text('Enter Purchase ID or QR code value to check-in a ticket.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
        const SizedBox(height: 24),
        TextField(
          controller: manualCtrl,
          decoration: const InputDecoration(
            labelText: 'QR Code Value / Purchase ID',
            hintText: 'Paste QR content here...',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.qr_code),
          ),
          maxLines: 3,
          onSubmitted: (_) => manualCheckIn(),
        ),
        const SizedBox(height: 16),
        SizedBox(width: double.infinity, height: 48, child: FilledButton.icon(
          onPressed: manualCheckIn,
          icon: const Icon(Icons.check_circle),
          label: const Text('Check In'),
        )),
        if (scanned) ...[
          const SizedBox(height: 24),
          Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(children: [
            Text(result ?? '', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
            const SizedBox(height: 12),
            FilledButton.tonal(onPressed: onReset, child: const Text('Check Another')),
          ]))),
        ],
      ]),
    );
  }
}

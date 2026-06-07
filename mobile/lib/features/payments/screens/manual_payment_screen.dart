import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/auth_provider.dart';

class ManualPaymentScreen extends ConsumerStatefulWidget {
  final String? paymentId;
  final double? amount;
  final String? metadata;

  const ManualPaymentScreen({
    super.key,
    this.paymentId,
    this.amount,
    this.metadata,
  });

  @override
  ConsumerState<ManualPaymentScreen> createState() =>
      _ManualPaymentScreenState();
}

class _ManualPaymentScreenState extends ConsumerState<ManualPaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _refNumberCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  
  XFile? _receiptImage;
  bool _uploading = false;
  String? _error;
  String _selectedMethod = 'BANK';

  @override
  void dispose() {
    _refNumberCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1200,
        maxHeight: 1200,
        imageQuality: 85,
      );
      if (image != null && mounted) {
        setState(() => _receiptImage = image);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to pick image: $e')),
        );
      }
    }
  }

  void _removeImage() {
    setState(() => _receiptImage = null);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_receiptImage == null) {
      setState(() => _error = 'Please upload payment receipt');
      return;
    }

    setState(() {
      _uploading = true;
      _error = null;
    });

    try {
      final api = ref.read(apiServiceProvider);
      
      MultipartFile receiptMultipart;
      if (kIsWeb) {
        final bytes = await _receiptImage!.readAsBytes();
        receiptMultipart = MultipartFile.fromBytes(bytes, filename: _receiptImage!.name);
      } else {
        receiptMultipart = await MultipartFile.fromFile(_receiptImage!.path, filename: 'receipt.jpg');
      }

      final formData = FormData.fromMap({
        'receipt': receiptMultipart,
        'senderName': 'User Payment',
        'transactionRef': _refNumberCtrl.text.trim(),
        'paymentMethod': _selectedMethod,
        'paidAt': DateTime.now().toIso8601String(),
        if (_notesCtrl.text.trim().isNotEmpty) 'notes': _notesCtrl.text.trim(),
      });

      await api.dio.post(
        '/manual-payments/${widget.paymentId}/proof',
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );

      if (mounted) {
        // Parse metadata to determine payment type
        final isTicketPayment = widget.metadata?.contains('TICKET') ?? false;
        final isMembershipPayment = widget.metadata?.contains('MEMBERSHIP') ?? false;
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: const [
                Icon(Icons.check_circle, color: Colors.white),
                SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Payment proof submitted! Admin will review shortly.',
                  ),
                ),
              ],
            ),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 4),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
        
        // Navigate based on payment type
        if (isMembershipPayment) {
          // For membership, go back to membership screen
          context.go('/membership');
        } else if (isTicketPayment) {
          // For tickets, go to my tickets
          context.go('/my-tickets');
        } else {
          // Default: go back to home
          context.go('/');
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _uploading = false;
          _error = 'Submission failed: ${e.toString()}';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(title: const Text('Manual Payment'), elevation: 0),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHeader(),
                const SizedBox(height: 24),
                _buildAmountCard(),
                const SizedBox(height: 24),
                _buildAccountInfoCard(),
                const SizedBox(height: 24),
                _buildPaymentMethodSelector(),
                const SizedBox(height: 24),
                _buildForm(),
                const SizedBox(height: 32),
                _buildSubmitButton(),
                if (_error != null) ...[
                  const SizedBox(height: 16),
                  _buildErrorBanner(),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Theme.of(context).primaryColor,
                Theme.of(context).colorScheme.secondary,
              ],
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Theme.of(context).primaryColor.withOpacity(0.3),
                blurRadius: 30,
                spreadRadius: 5,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: const Icon(Icons.receipt_long_rounded, size: 56, color: Colors.white),
        ),
        const SizedBox(height: 20),
        Text(
          'Upload Payment Proof',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildAmountCard() {
    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            colors: [
              Theme.of(context).primaryColor.withOpacity(0.1),
              Theme.of(context).colorScheme.secondary.withOpacity(0.05),
            ],
          ),
        ),
        child: Column(
          children: [
            Text('Amount to Pay', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '${widget.amount?.toStringAsFixed(2) ?? '0.00'}',
                  style: Theme.of(context).textTheme.displaySmall?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: Theme.of(context).primaryColor,
                      ),
                ),
                const SizedBox(width: 8),
                Text('ETB', style: Theme.of(context).textTheme.titleLarge),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountInfoCard() {
    String accountNumber = '';
    String bankName = '';
    String extraInfo = '';
    IconData icon;
    Color color;

    switch (_selectedMethod) {
      case 'BANK':
        accountNumber = '1000123456789';
        bankName = 'Commercial Bank of Ethiopia';
        extraInfo = 'Account: KSKA';
        icon = Icons.account_balance_rounded;
        color = Colors.blue;
        break;
      case 'MOBILE':
        accountNumber = '+251 911 234 567';
        bankName = 'Telebirr / M-Birr';
        extraInfo = 'Name: KSKA';
        icon = Icons.phone_android_rounded;
        color = Colors.green;
        break;
      case 'CASH':
        accountNumber = 'Main Office, Bole';
        bankName = 'Cash Payment';
        extraInfo = 'Hours: Mon-Fri 9AM-5PM';
        icon = Icons.store_rounded;
        color = Colors.orange;
        break;
      default:
        accountNumber = '';
        bankName = '';
        extraInfo = '';
        icon = Icons.payment_rounded;
        color = Theme.of(context).primaryColor;
    }

    return Card(
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            colors: [color.withOpacity(0.1), Colors.white],
          ),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [color, color.withOpacity(0.8)]),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(icon, color: Colors.white, size: 32),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(bankName, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                        Text(extraInfo, style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 14)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_selectedMethod == 'BANK' ? 'Account Number' : _selectedMethod == 'MOBILE' ? 'Phone Number' : 'Location',
                            style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 4),
                        Text(accountNumber, style: TextStyle(color: Colors.grey.shade900, fontSize: 16, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                  if (_selectedMethod != 'CASH')
                    IconButton(
                      icon: Icon(Icons.copy_rounded, color: color),
                      onPressed: () async {
                        await Clipboard.setData(ClipboardData(text: accountNumber));
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text('Copied to clipboard!'),
                              backgroundColor: color,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        }
                      },
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentMethodSelector() {
    final methods = [
      {'id': 'BANK', 'name': 'Bank', 'icon': Icons.account_balance_rounded, 'color': Colors.blue},
      {'id': 'MOBILE', 'name': 'Mobile', 'icon': Icons.phone_android_rounded, 'color': Colors.green},
      {'id': 'CASH', 'name': 'Cash', 'icon': Icons.money_rounded, 'color': Colors.orange},
    ];

    return Row(
      children: methods.map((method) {
        final isSelected = _selectedMethod == method['id'];
        final color = method['color'] as Color;

        return Expanded(
          child: Padding(
            padding: const EdgeInsets.only(right: 8),
            child: InkWell(
              onTap: () => setState(() => _selectedMethod = method['id'] as String),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isSelected ? color : Colors.grey.shade300, width: isSelected ? 2.5 : 1.5),
                  color: isSelected ? color.withOpacity(0.1) : Colors.white,
                ),
                child: Column(
                  children: [
                    Icon(method['icon'] as IconData, color: isSelected ? color : Colors.grey.shade600, size: 28),
                    const SizedBox(height: 8),
                    Text(
                      method['name'] as String,
                      style: TextStyle(fontSize: 12, fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600, color: isSelected ? color : Colors.grey.shade700),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextFormField(
          controller: _refNumberCtrl,
          decoration: InputDecoration(
            labelText: 'Reference Number',
            prefixIcon: Icon(Icons.numbers_rounded, color: Theme.of(context).primaryColor),
          ),
          validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null,
        ),
        const SizedBox(height: 20),
        TextFormField(
          controller: _notesCtrl,
          maxLines: 3,
          decoration: InputDecoration(
            labelText: 'Notes (Optional)',
            prefixIcon: Icon(Icons.note_rounded, color: Theme.of(context).primaryColor),
          ),
        ),
        const SizedBox(height: 24),
        Text('Payment Receipt', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
        const SizedBox(height: 12),
        if (_receiptImage == null) _buildUploadButton() else _buildReceiptPreview(),
      ],
    );
  }

  Widget _buildUploadButton() {
    return InkWell(
      onTap: _pickImage,
      child: Container(
        height: 180,
        decoration: BoxDecoration(
          border: Border.all(color: Theme.of(context).primaryColor.withOpacity(0.3), width: 2),
          borderRadius: BorderRadius.circular(16),
          color: Theme.of(context).primaryColor.withOpacity(0.05),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.cloud_upload_rounded, size: 48, color: Theme.of(context).primaryColor),
            const SizedBox(height: 16),
            Text('Upload Receipt', style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).primaryColor)),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiptPreview() {
    return Card(
      child: Column(
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            child: SizedBox(
              height: 200,
              width: double.infinity,
              child: kIsWeb
                  ? Image.network(_receiptImage!.path, fit: BoxFit.cover)
                  : Image.file(File(_receiptImage!.path), fit: BoxFit.cover),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.green),
                const SizedBox(width: 12),
                const Expanded(child: Text('Receipt attached', style: TextStyle(fontWeight: FontWeight.w600))),
                IconButton(icon: const Icon(Icons.close_rounded), color: Colors.red, onPressed: _removeImage),
                IconButton(icon: const Icon(Icons.edit_rounded), color: Theme.of(context).primaryColor, onPressed: _pickImage),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      height: 60,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(18),
          gradient: LinearGradient(colors: [Theme.of(context).primaryColor, Theme.of(context).colorScheme.secondary]),
          boxShadow: [BoxShadow(color: Theme.of(context).primaryColor.withOpacity(0.4), blurRadius: 20, offset: const Offset(0, 10))],
        ),
        child: ElevatedButton(
          onPressed: _uploading ? null : _submit,
          style: ElevatedButton.styleFrom(backgroundColor: Colors.transparent, shadowColor: Colors.transparent),
          child: _uploading
              ? const SizedBox(width: 28, height: 28, child: CircularProgressIndicator(strokeWidth: 3, color: Colors.white))
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Text('Submit Payment', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                    SizedBox(width: 12),
                    Icon(Icons.check_circle_rounded, size: 24),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.red.shade300, width: 1.5),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline_rounded, color: Colors.red.shade700),
          const SizedBox(width: 14),
          Expanded(child: Text(_error!, style: TextStyle(color: Colors.red.shade800, fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}

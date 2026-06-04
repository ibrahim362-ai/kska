import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:go_router/go_router.dart';
import '../../models/models.dart';
import '../../services/api_service.dart';

final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

class ManualPaymentScreen extends ConsumerStatefulWidget {
  final String? paymentId;          // If null, screen fetches instructions + shows flow
  final double? amount;             // For membership/ticket purchase
  final String? metadata;           // JSON-encoded metadata { type, targetId, targetName }

  const ManualPaymentScreen({
    super.key,
    this.paymentId,
    this.amount,
    this.metadata,
  });

  @override
  ConsumerState<ManualPaymentScreen> createState() => _ManualPaymentScreenState();
}

class _ManualPaymentScreenState extends ConsumerState<ManualPaymentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _api = ApiService();
  final _picker = ImagePicker();

  ManualPaymentInstructions? _instructions;
  bool _loadingInstructions = true;
  bool _submitting = false;

  XFile? _receipt;
  final _senderNameCtrl = TextEditingController();
  final _senderPhoneCtrl = TextEditingController();
  final _transactionRefCtrl = TextEditingController();
  final _notesCtrl = TextEditingController();
  DateTime _paidAt = DateTime.now();
  String? _createdPaymentId;
  String? _proofStatus;
  String? _rejectionReason;

  @override
  void initState() {
    super.initState();
    _loadInstructions();
  }

  @override
  void dispose() {
    _senderNameCtrl.dispose();
    _senderPhoneCtrl.dispose();
    _transactionRefCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadInstructions() async {
    try {
      final instructions = await _api.getManualPaymentInstructions();
      setState(() {
        _instructions = instructions;
        _loadingInstructions = false;
      });
    } catch (e) {
      setState(() => _loadingInstructions = false);
      _showError('Failed to load payment info: $e');
    }
  }

  Future<void> _pickReceipt(ImageSource source) async {
    try {
      final file = await _picker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 2000,
      );
      if (file != null) {
        setState(() => _receipt = file);
      }
    } catch (e) {
      _showError('Could not pick image: $e');
    }
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _paidAt,
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() => _paidAt = picked);
    }
  }

  Future<void> _submit() async {
    if (_receipt == null) {
      _showError('Please attach a receipt screenshot');
      return;
    }
    if (!_formKey.currentState!.validate()) return;

    setState(() => _submitting = true);

    try {
      // Step 1: Create payment record if not already
      String? paymentId = widget.paymentId ?? _createdPaymentId;
      if (paymentId == null && widget.amount != null) {
        final payment = await _api.createPayment(
          amount: widget.amount!,
          metadata: widget.metadata,
        );
        paymentId = payment['id'] as String;
        _createdPaymentId = paymentId;
      }

      if (paymentId == null) {
        throw Exception('Payment ID is required');
      }

      // Step 2: Submit proof
      final proof = await _api.submitManualProof(
        paymentId: paymentId,
        receiptFile: _receipt!,
        senderName: _senderNameCtrl.text.trim(),
        senderPhone: _senderPhoneCtrl.text.trim().isEmpty ? null : _senderPhoneCtrl.text.trim(),
        transactionRef: _transactionRefCtrl.text.trim().isEmpty ? null : _transactionRefCtrl.text.trim(),
        paidAt: _paidAt,
        notes: _notesCtrl.text.trim().isEmpty ? null : _notesCtrl.text.trim(),
      );

      setState(() {
        _proofStatus = proof.status;
      });

      _showSuccess('Receipt submitted! Admin will review within 24 hours.');
    } catch (e) {
      _showError('Submission failed: $e');
    } finally {
      setState(() => _submitting = false);
    }
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.red),
    );
  }

  void _showSuccess(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.green),
    );
  }

  void _copyToClipboard(String text) {
    Clipboard.setData(ClipboardData(text: text));
    _showSuccess('Copied to clipboard');
  }

  @override
  Widget build(BuildContext context) {
    if (_proofStatus != null) {
      return _buildSubmittedView();
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Manual Payment'),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
      ),
      body: _loadingInstructions
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_instructions != null) ...[
                      _buildInstructionsCard(),
                      const SizedBox(height: 20),
                    ],
                    if (widget.amount != null) _buildAmountCard(),
                    const SizedBox(height: 20),
                    _buildReceiptPicker(),
                    const SizedBox(height: 20),
                    _buildDetailsForm(),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: FilledButton.icon(
                        onPressed: _submitting ? null : _submit,
                        icon: _submitting
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Icon(Icons.send),
                        label: Text(_submitting ? 'Submitting...' : 'Submit Receipt'),
                        style: FilledButton.styleFrom(backgroundColor: Colors.indigo),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextButton.icon(
                      onPressed: () => context.pop(),
                      icon: const Icon(Icons.arrow_back, size: 16),
                      label: const Text('Back'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildInstructionsCard() {
    final inst = _instructions!;
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.info_outline, color: Colors.indigo),
                const SizedBox(width: 8),
                Text('How to Pay',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        )),
              ],
            ),
            const SizedBox(height: 8),
            Text(inst.instructions, style: const TextStyle(color: Colors.black87)),
            const SizedBox(height: 16),
            if (inst.accounts.bank != null) _buildAccountTile('🏦', inst.accounts.bank!.bankName ?? 'Bank',
                inst.accounts.bank!.accountNumber ?? '', inst.accounts.bank!.accountHolder ?? ''),
            if (inst.accounts.telebirr != null) _buildAccountTile('📱', 'Telebirr',
                inst.accounts.telebirr!.number ?? '', ''),
            if (inst.accounts.awash != null) _buildAccountTile('🏦', 'Awash Bank',
                inst.accounts.awash!.accountNumber ?? '', inst.accounts.awash!.accountHolder ?? ''),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountTile(String emoji, String label, String number, String holder) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
                Text(number, style: const TextStyle(fontFamily: 'monospace', fontSize: 14)),
                if (holder.isNotEmpty)
                  Text(holder, style: TextStyle(fontSize: 12, color: Colors.grey.shade700)),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.copy, size: 18),
            onPressed: () => _copyToClipboard(number),
            tooltip: 'Copy',
          ),
        ],
      ),
    );
  }

  Widget _buildAmountCard() {
    return Card(
      color: Colors.indigo.shade50,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Icon(Icons.payments, color: Colors.indigo),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Amount to Pay', style: TextStyle(fontSize: 12, color: Colors.grey)),
                Text('${widget.amount!.toStringAsFixed(2)} ETB',
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiptPicker() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Receipt Screenshot *',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            if (_receipt == null)
              Container(
                height: 150,
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300, style: BorderStyle.solid),
                ),
                child: const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.receipt_long, size: 40, color: Colors.grey),
                      SizedBox(height: 8),
                      Text('No receipt attached', style: TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              )
            else
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  'file:///${_receipt!.path}',
                  height: 150,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    height: 150,
                    color: Colors.grey.shade100,
                    child: const Center(child: Icon(Icons.image, size: 40)),
                  ),
                ),
              ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _pickReceipt(ImageSource.camera),
                    icon: const Icon(Icons.camera_alt),
                    label: const Text('Camera'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _pickReceipt(ImageSource.gallery),
                    icon: const Icon(Icons.photo_library),
                    label: const Text('Gallery'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailsForm() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Payment Details',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextFormField(
              controller: _senderNameCtrl,
              decoration: const InputDecoration(
                labelText: 'Sender Name *',
                hintText: 'Name on the account you sent from',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.person),
              ),
              validator: (v) => (v == null || v.trim().length < 2) ? 'Enter sender name' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _senderPhoneCtrl,
              decoration: const InputDecoration(
                labelText: 'Sender Phone (optional)',
                hintText: '+251911223344',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.phone),
              ),
              keyboardType: TextInputType.phone,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _transactionRefCtrl,
              decoration: const InputDecoration(
                labelText: 'Transaction Reference (optional)',
                hintText: 'Bank/Telebirr transaction ID',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.tag),
              ),
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: _pickDate,
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Date Paid *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.calendar_today),
                ),
                child: Text(
                  '${_paidAt.year}-${_paidAt.month.toString().padLeft(2, '0')}-${_paidAt.day.toString().padLeft(2, '0')}',
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _notesCtrl,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Notes (optional)',
                hintText: 'Any additional info for the admin',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.notes),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmittedView() {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Submission Received'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.check_circle, size: 80, color: Colors.green),
              ),
              const SizedBox(height: 24),
              Text('Receipt Submitted!',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              const Text(
                'Your payment is being reviewed by our team. '
                'You will receive a notification within 24 hours.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 32),
              FilledButton.icon(
                onPressed: () => context.go('/'),
                icon: const Icon(Icons.home),
                label: const Text('Back to Home'),
                style: FilledButton.styleFrom(backgroundColor: Colors.indigo),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

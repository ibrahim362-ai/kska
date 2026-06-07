import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/models.dart';

class TicketsScreen extends ConsumerStatefulWidget {
  const TicketsScreen({super.key});
  @override
  ConsumerState<TicketsScreen> createState() => _TicketsScreenState();
}

class _TicketsScreenState extends ConsumerState<TicketsScreen> {
  List<TicketModel> _tickets = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    
    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.dio.get('/tickets', queryParameters: {'limit': 20});
      
      // Debug: Print ticket data to see coverImage
      print('=== TICKETS DEBUG ===');
      print('Total tickets: ${(res.data['data'] as List).length}');
      for (var ticket in res.data['data']) {
        print('Ticket: ${ticket['title']} - coverImage: ${ticket['coverImage']}');
      }
      print('===================');
      
      setState(() {
        _tickets = (res.data['data'] as List)
            .map((t) => TicketModel.fromJson(t))
            .toList();
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load tickets. Pull to refresh.';
        _loading = false;
      });
    }
  }

  Future<void> _buy(TicketModel t) async {
    // Show dialog to optionally enter referral code
    String? referralCode;
    final shouldProceed = await showDialog<bool>(
      context: context,
      builder: (ctx) {
        final codeController = TextEditingController();
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: Row(
            children: [
              Icon(Icons.shopping_cart, color: Theme.of(context).primaryColor),
              const SizedBox(width: 12),
              const Expanded(child: Text('Purchase Ticket')),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.confirmation_number, 
                      color: Theme.of(context).primaryColor,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            t.title,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          Text(
                            t.price > 0 
                                ? 'ETB ${t.price.toStringAsFixed(2)}'
                                : 'FREE',
                            style: TextStyle(
                              color: Theme.of(context).primaryColor,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: codeController,
                decoration: InputDecoration(
                  labelText: 'Referral Code (Optional)',
                  hintText: 'REF-XXXXXXXX',
                  border: const OutlineInputBorder(),
                  prefixIcon: const Icon(Icons.card_giftcard),
                  helperText: 'Help a friend earn +10 points!',
                  helperStyle: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade600,
                  ),
                ),
                textCapitalization: TextCapitalization.characters,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel'),
            ),
            FilledButton.icon(
              onPressed: () {
                referralCode = codeController.text.trim();
                Navigator.pop(ctx, true);
              },
              icon: const Icon(Icons.check_circle),
              label: const Text('Confirm Purchase'),
            ),
          ],
        );
      },
    );

    if (shouldProceed != true) return;

    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => const Center(
        child: Card(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 16),
                Text('Processing purchase...'),
              ],
            ),
          ),
        ),
      ),
    );

    final api = ref.read(apiServiceProvider);
    try {
      // Direct ticket purchase with optional referral code
      final data = {
        'ticketId': t.id,
        if (referralCode != null && referralCode!.isNotEmpty) 
          'referralCode': referralCode,
      };
      final res = await api.dio.post('/tickets/purchase', data: data);

      // Close loading dialog
      if (mounted) Navigator.pop(context);
      
      if (mounted) {
        if (t.price > 0) {
          // Paid ticket - show success then navigate to payment
          await _showSuccessDialog(
            title: 'Purchase Initiated!',
            message: 'Please complete the payment to confirm your ticket.',
            icon: Icons.payment,
          );
          
          final payment = res.data['data']['payment'];
          final paymentId = payment?['id'] ?? payment?['_id'];
          
          if (paymentId != null && mounted) {
            context.push('/manual-payment', extra: {
              'paymentId': paymentId,
              'amount': t.price,
              'metadata': 'Ticket: ${t.title}',
            });
          }
        } else {
          // Free ticket - show success
          await _showSuccessDialog(
            title: 'Success!',
            message: 'Free ticket acquired! Check "My Tickets" to view your ticket.',
            icon: Icons.check_circle,
            showViewTicketsButton: true,
          );
        }
      }
      
      // Refresh tickets list
      _fetch();
      
    } catch (e) {
      // Close loading dialog
      if (mounted) Navigator.pop(context);
      
      print('Purchase error: $e');
      if (mounted) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: Row(
              children: [
                Icon(Icons.error, color: Colors.red.shade400),
                const SizedBox(width: 12),
                const Text('Purchase Failed'),
              ],
            ),
            content: Text('Error: $e'),
            actions: [
              FilledButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    }
  }

  Future<void> _showSuccessDialog({
    required String title,
    required String message,
    required IconData icon,
    bool showViewTicketsButton = false,
  }) async {
    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Animated success icon
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.0, end: 1.0),
              duration: const Duration(milliseconds: 600),
              curve: Curves.elasticOut,
              builder: (context, value, child) {
                return Transform.scale(
                  scale: value,
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      icon,
                      size: 64,
                      color: Colors.green.shade600,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              message,
              style: TextStyle(
                fontSize: 15,
                color: Colors.grey.shade600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          // Two prominent buttons side by side
          if (showViewTicketsButton)
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  context.push('/my-tickets');
                },
                icon: const Icon(Icons.confirmation_number_rounded),
                label: const Text('View Ticket'),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          if (showViewTicketsButton) const SizedBox(width: 8),
          Expanded(
            child: FilledButton.icon(
              onPressed: () => Navigator.pop(ctx),
              icon: const Icon(Icons.arrow_forward),
              label: const Text('Continue'),
              style: FilledButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ],
        actionsAlignment: MainAxisAlignment.spaceEvenly,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tickets'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Theme.of(context).primaryColor.withOpacity(0.1),
                  Theme.of(context).colorScheme.secondary.withOpacity(0.05),
                ],
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Theme.of(context).primaryColor.withOpacity(0.2),
                width: 1.5,
              ),
            ),
            child: TextButton.icon(
              onPressed: () => context.push('/my-tickets'),
              icon: Icon(Icons.qr_code_rounded, size: 18, color: Theme.of(context).primaryColor),
              label: Text(
                'My Tickets',
                style: TextStyle(
                  color: Theme.of(context).primaryColor,
                  fontWeight: FontWeight.w700,
                ),
              ),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
            ),
          ),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Theme.of(context).primaryColor.withOpacity(0.03),
              Theme.of(context).colorScheme.secondary.withOpacity(0.01),
            ],
          ),
        ),
        child: RefreshIndicator(
          onRefresh: _fetch,
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(24),
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.red.shade50,
                                    Colors.red.shade100.withOpacity(0.5),
                                  ],
                                ),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.error_outline_rounded,
                                size: 64,
                                color: Colors.red.shade300,
                              ),
                            ),
                            const SizedBox(height: 24),
                            Text(
                              _error!,
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 24),
                            FilledButton.icon(
                              onPressed: _fetch,
                              icon: const Icon(Icons.refresh_rounded),
                              label: const Text('Try Again'),
                            ),
                          ],
                        ),
                      ),
                    )
                  : _tickets.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.confirmation_number_rounded,
                                  size: 80,
                                  color: Colors.grey.shade300,
                                ),
                                const SizedBox(height: 20),
                                Text(
                                  'No Tickets Available',
                                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                        fontWeight: FontWeight.w700,
                                      ),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  'Check back later for upcoming events',
                                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                        color: Colors.grey.shade600,
                                      ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          itemCount: _tickets.length,
                          itemBuilder: (_, i) => _buildCard(_tickets[i], i),
                        ),
        ),
      ),
    );
  }

  Widget _buildCard(TicketModel t, int index) {
    final colors = {
      'ACTIVE': const Color(0xFF10B981),
      'SOLD_OUT': const Color(0xFFEF4444),
      'CANCELLED': Colors.grey,
    };
    final statusColor = colors[t.status] ?? Colors.grey;
    
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: Duration(milliseconds: 400 + (index * 100)),
      curve: Curves.easeOutCubic,
      builder: (context, value, child) {
        return Transform.translate(
          offset: Offset(0, 20 * (1 - value)),
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: Card(
        margin: const EdgeInsets.only(bottom: 20),
        clipBehavior: Clip.antiAlias,
        elevation: 4,
        shadowColor: Theme.of(context).primaryColor.withOpacity(0.15),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: InkWell(
          onTap: () => context.push('/tickets/${t.id}'),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cover Image with overlay
              Stack(
                children: [
                  if (t.coverImage != null && t.coverImage!.isNotEmpty)
                    CachedNetworkImage(
                      imageUrl: t.coverImage!,
                      height: 220,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        height: 220,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Colors.grey.shade300,
                              Colors.grey.shade200,
                            ],
                          ),
                        ),
                        child: const Center(
                          child: CircularProgressIndicator(strokeWidth: 3),
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        height: 220,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Theme.of(context).primaryColor.withOpacity(0.6),
                              Theme.of(context).colorScheme.secondary.withOpacity(0.6),
                            ],
                          ),
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.confirmation_number_rounded,
                            size: 72,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    )
                  else
                    Container(
                      height: 220,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Theme.of(context).primaryColor,
                            Theme.of(context).colorScheme.secondary,
                            Theme.of(context).colorScheme.tertiary,
                          ],
                        ),
                      ),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.confirmation_number_rounded,
                              size: 72,
                              color: Colors.white.withOpacity(0.9),
                            ),
                            const SizedBox(height: 12),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 24),
                              child: Text(
                                t.title,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 22,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.5,
                                ),
                                textAlign: TextAlign.center,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  // Gradient overlay
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.black.withOpacity(0.0),
                            Colors.black.withOpacity(0.3),
                          ],
                        ),
                      ),
                    ),
                  ),
                  // Status badge
                  Positioned(
                    top: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            statusColor,
                            statusColor.withOpacity(0.8),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: statusColor.withOpacity(0.4),
                            blurRadius: 12,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            t.status == 'ACTIVE'
                                ? Icons.check_circle_rounded
                                : t.status == 'SOLD_OUT'
                                    ? Icons.cancel_rounded
                                    : Icons.block_rounded,
                            size: 14,
                            color: Colors.white,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            t.status,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              // Content
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      t.title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 20,
                        letterSpacing: -0.5,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Theme.of(context).primaryColor.withOpacity(0.15),
                                Theme.of(context).colorScheme.secondary.withOpacity(0.08),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Theme.of(context).primaryColor.withOpacity(0.2),
                              width: 1,
                            ),
                          ),
                          child: Icon(
                            Icons.calendar_today_rounded,
                            size: 18,
                            color: Theme.of(context).primaryColor,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Text(
                          '${t.eventDate.day}/${t.eventDate.month}/${t.eventDate.year}',
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        if (t.location != null) ...[
                          const SizedBox(width: 16),
                          Icon(
                            Icons.location_on_rounded,
                            size: 18,
                            color: Colors.grey.shade500,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              t.location!,
                              style: TextStyle(
                                color: Colors.grey.shade600,
                                fontSize: 14,
                                fontWeight: FontWeight.w500,
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 18),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Theme.of(context).primaryColor.withOpacity(0.08),
                            Theme.of(context).colorScheme.secondary.withOpacity(0.04),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: Theme.of(context).primaryColor.withOpacity(0.15),
                          width: 1.5,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Price',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade600,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                t.price > 0 ? 'ETB ${t.price.toStringAsFixed(2)}' : 'FREE',
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 24,
                                  color: t.price > 0
                                      ? const Color(0xFF10B981)
                                      : Theme.of(context).primaryColor,
                                  letterSpacing: -0.5,
                                ),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                'Available',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.grey.shade600,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${t.quantity - t.soldCount}/${t.quantity}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 20,
                                  letterSpacing: -0.3,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: TweenAnimationBuilder<double>(
                        tween: Tween(begin: 0.0, end: t.quantity > 0 ? t.soldCount / t.quantity : 0),
                        duration: const Duration(milliseconds: 1000),
                        curve: Curves.easeOutCubic,
                        builder: (context, value, child) {
                          return Container(
                            height: 10,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              color: Colors.grey.shade200,
                            ),
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: value,
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      Theme.of(context).primaryColor,
                                      Theme.of(context).colorScheme.secondary,
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    if (t.status == 'ACTIVE') ...[
                      const SizedBox(height: 20),
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: LinearGradient(
                              colors: [
                                Theme.of(context).primaryColor,
                                Theme.of(context).colorScheme.secondary,
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Theme.of(context).primaryColor.withOpacity(0.4),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: ElevatedButton.icon(
                            onPressed: () => _buy(t),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                            icon: const Icon(
                              Icons.shopping_cart_rounded,
                              size: 24,
                            ),
                            label: Text(
                              t.price > 0 ? 'Buy Now' : 'Get Free Ticket',
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

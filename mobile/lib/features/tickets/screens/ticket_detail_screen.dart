import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import '../../../providers/auth_provider.dart';
import '../../../models/models.dart';

class TicketDetailScreen extends ConsumerStatefulWidget {
  final String ticketId;
  
  const TicketDetailScreen({super.key, required this.ticketId});
  
  @override
  ConsumerState<TicketDetailScreen> createState() => _TicketDetailScreenState();
}

class _TicketDetailScreenState extends ConsumerState<TicketDetailScreen> {
  TicketModel? _ticket;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchTicket();
  }

  Future<void> _fetchTicket() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    
    try {
      final api = ref.read(apiServiceProvider);
      final res = await api.dio.get('/tickets/${widget.ticketId}');
      
      // Debug: Print ticket coverImage
      print('=== TICKET DETAIL DEBUG ===');
      print('Ticket ID: ${widget.ticketId}');
      print('Ticket Title: ${res.data['data']['title']}');
      print('Cover Image: ${res.data['data']['coverImage']}');
      print('==========================');
      
      setState(() {
        _ticket = TicketModel.fromJson(res.data['data']);
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load ticket details';
        _loading = false;
      });
    }
  }

  Future<void> _purchaseTicket() async {
    if (_ticket == null) return;
    
    // Show purchase options dialog
    await _showPurchaseOptionsDialog();
  }

  Future<void> _showPurchaseOptionsDialog() async {
    bool isVip = false;
    bool isGift = false;
    List<String> familyMembers = [];
    final giftNameController = TextEditingController();
    final giftPhoneController = TextEditingController();
    final giftEmailController = TextEditingController();
    
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            // Calculate final price
            double basePrice = isVip && _ticket!.hasVipOption 
                ? (_ticket!.vipPrice ?? _ticket!.price)
                : _ticket!.price;
            
            // For family tickets, multiply by number of family members
            if (_ticket!.familyTicket && familyMembers.isNotEmpty) {
              basePrice = basePrice * familyMembers.length;
            }
            
            double finalPrice = _ticket!.discount > 0
                ? basePrice * (1 - _ticket!.discount / 100)
                : basePrice;
            int pointsToEarn = isVip ? _ticket!.vipPoints : _ticket!.pointsReward;
            
            return DraggableScrollableSheet(
              initialChildSize: 0.9,
              minChildSize: 0.5,
              maxChildSize: 0.95,
              expand: false,
              builder: (context, scrollController) {
                return Padding(
                  padding: EdgeInsets.only(
                    bottom: MediaQuery.of(context).viewInsets.bottom,
                  ),
                  child: Column(
                    children: [
                      // Handle bar
                      Container(
                        margin: const EdgeInsets.symmetric(vertical: 12),
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      Expanded(
                        child: ListView(
                          controller: scrollController,
                          padding: const EdgeInsets.all(24),
                          children: [
                            // Title
                            const Text(
                              'Purchase Options',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 24),
                            
                            // VIP Option
                            if (_ticket!.hasVipOption) ...[
                              Card(
                                elevation: isVip ? 4 : 1,
                                color: isVip ? Colors.purple.shade50 : null,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  side: BorderSide(
                                    color: isVip ? Colors.purple : Colors.grey.shade300,
                                    width: 2,
                                  ),
                                ),
                                child: CheckboxListTile(
                                  value: isVip,
                                  onChanged: (value) => setState(() => isVip = value!),
                                  title: const Row(
                                    children: [
                                      Icon(Icons.workspace_premium, color: Colors.purple),
                                      SizedBox(width: 8),
                                      Text(
                                        'VIP Ticket',
                                        style: TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                    ],
                                  ),
                                  subtitle: Text(
                                    'ETB ${(_ticket!.vipPrice ?? _ticket!.price).toStringAsFixed(2)} • +${_ticket!.vipPoints} points',
                                    style: const TextStyle(color: Colors.purple),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],
                            
                            // Buy for Another Person
                            Card(
                              elevation: isGift ? 4 : 1,
                              color: isGift ? Colors.orange.shade50 : null,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(
                                  color: isGift ? Colors.orange : Colors.grey.shade300,
                                  width: 2,
                                ),
                              ),
                              child: Column(
                                children: [
                                  CheckboxListTile(
                                    value: isGift,
                                    onChanged: (value) => setState(() => isGift = value!),
                                    title: const Row(
                                      children: [
                                        Icon(Icons.card_giftcard, color: Colors.orange),
                                        SizedBox(width: 8),
                                        Text(
                                          'Buy for Another Person',
                                          style: TextStyle(fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                                    subtitle: const Text('Gift this ticket to someone'),
                                  ),
                                  if (isGift) ...[
                                    const Divider(),
                                    Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        children: [
                                          TextField(
                                            controller: giftNameController,
                                            decoration: const InputDecoration(
                                              labelText: 'Recipient Name *',
                                              border: OutlineInputBorder(),
                                              prefixIcon: Icon(Icons.person),
                                            ),
                                          ),
                                          const SizedBox(height: 12),
                                          TextField(
                                            controller: giftPhoneController,
                                            decoration: const InputDecoration(
                                              labelText: 'Recipient Phone',
                                              border: OutlineInputBorder(),
                                              prefixIcon: Icon(Icons.phone),
                                            ),
                                            keyboardType: TextInputType.phone,
                                          ),
                                          const SizedBox(height: 12),
                                          TextField(
                                            controller: giftEmailController,
                                            decoration: const InputDecoration(
                                              labelText: 'Recipient Email',
                                              border: OutlineInputBorder(),
                                              prefixIcon: Icon(Icons.email),
                                            ),
                                            keyboardType: TextInputType.emailAddress,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                            
                            // Family Members (if family ticket)
                            if (_ticket!.familyTicket) ...[
                              Card(
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  side: BorderSide(color: Colors.blue.shade300, width: 2),
                                ),
                                child: Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          const Icon(Icons.family_restroom, color: Colors.blue),
                                          const SizedBox(width: 8),
                                          const Text(
                                            'Family Members',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16,
                                            ),
                                          ),
                                          const Spacer(),
                                          Text(
                                            'Max: ${_ticket!.maxFamilyMembers}',
                                            style: TextStyle(color: Colors.grey.shade600),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      ...familyMembers.asMap().entries.map((entry) {
                                        int idx = entry.key;
                                        return Padding(
                                          padding: const EdgeInsets.only(bottom: 8),
                                          child: Row(
                                            children: [
                                              Expanded(
                                                child: Text(
                                                  '${idx + 1}. ${entry.value}',
                                                  style: const TextStyle(fontSize: 15),
                                                ),
                                              ),
                                              IconButton(
                                                icon: const Icon(Icons.delete, color: Colors.red),
                                                onPressed: () {
                                                  setState(() => familyMembers.removeAt(idx));
                                                },
                                              ),
                                            ],
                                          ),
                                        );
                                      }),
                                      if (familyMembers.length < (_ticket!.maxFamilyMembers ?? 5))
                                        OutlinedButton.icon(
                                          onPressed: () async {
                                            final name = await _showAddMemberDialog();
                                            if (name != null && name.isNotEmpty) {
                                              setState(() => familyMembers.add(name));
                                            }
                                          },
                                          icon: const Icon(Icons.add),
                                          label: const Text('Add Family Member'),
                                        ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],
                            
                            // Price Summary
                            Card(
                              color: Colors.green.shade50,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                                side: BorderSide(color: Colors.green.shade300, width: 2),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Price Summary',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          isVip ? 'VIP Price (per person):' : 'Regular Price (per person):',
                                          style: TextStyle(color: Colors.grey.shade700),
                                        ),
                                        Text(
                                          'ETB ${(isVip && _ticket!.hasVipOption ? (_ticket!.vipPrice ?? _ticket!.price) : _ticket!.price).toStringAsFixed(2)}',
                                          style: TextStyle(color: Colors.grey.shade700),
                                        ),
                                      ],
                                    ),
                                    // Show family members count if applicable
                                    if (_ticket!.familyTicket && familyMembers.isNotEmpty) ...[
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            'Family Members:',
                                            style: TextStyle(color: Colors.grey.shade700),
                                          ),
                                          Text(
                                            '× ${familyMembers.length}',
                                            style: TextStyle(
                                              color: Colors.blue.shade700,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text(
                                            'Subtotal:',
                                            style: TextStyle(fontWeight: FontWeight.w600),
                                          ),
                                          Text(
                                            'ETB ${basePrice.toStringAsFixed(2)}',
                                            style: TextStyle(
                                              decoration: _ticket!.discount > 0 
                                                  ? TextDecoration.lineThrough 
                                                  : null,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                    if (_ticket!.discount > 0) ...[
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            'Discount (${_ticket!.discount.toStringAsFixed(0)}%):',
                                            style: const TextStyle(color: Colors.green),
                                          ),
                                          Text(
                                            '-ETB ${(basePrice - finalPrice).toStringAsFixed(2)}',
                                            style: const TextStyle(
                                              color: Colors.green,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                    const Divider(height: 24),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Text(
                                          'Final Price:',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 18,
                                          ),
                                        ),
                                        Text(
                                          finalPrice > 0 
                                              ? 'ETB ${finalPrice.toStringAsFixed(2)}'
                                              : 'FREE',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 20,
                                            color: Colors.green,
                                          ),
                                        ),
                                      ],
                                    ),
                                    if (pointsToEarn > 0) ...[
                                      const SizedBox(height: 8),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text('Points to Earn:'),
                                          Text(
                                            '+$pointsToEarn points',
                                            style: const TextStyle(
                                              color: Colors.amber,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),
                            
                            // Confirm Button
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton.icon(
                                onPressed: () {
                                  // Validation
                                  if (isGift && giftNameController.text.trim().isEmpty) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('Please enter recipient name'),
                                        backgroundColor: Colors.orange,
                                      ),
                                    );
                                    return;
                                  }
                                  
                                  // Validate family ticket has at least 1 member
                                  if (_ticket!.familyTicket && familyMembers.isEmpty) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('Please add at least 1 family member'),
                                        backgroundColor: Colors.blue,
                                      ),
                                    );
                                    return;
                                  }
                                  
                                  Navigator.pop(context);
                                  _confirmPurchase(
                                    isVip: isVip,
                                    isGift: isGift,
                                    recipientName: isGift ? giftNameController.text.trim() : null,
                                    recipientPhone: isGift ? giftPhoneController.text.trim() : null,
                                    recipientEmail: isGift ? giftEmailController.text.trim() : null,
                                    familyMembers: _ticket!.familyTicket && familyMembers.isNotEmpty 
                                        ? familyMembers 
                                        : null,
                                  );
                                },
                                icon: const Icon(Icons.check_circle),
                                label: const Text(
                                  'Confirm Purchase',
                                  style: TextStyle(fontSize: 18),
                                ),
                                style: FilledButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  Future<String?> _showAddMemberDialog() async {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Family Member'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Full Name',
            border: OutlineInputBorder(),
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  Future<void> _confirmPurchase({
    required bool isVip,
    required bool isGift,
    String? recipientName,
    String? recipientPhone,
    String? recipientEmail,
    List<String>? familyMembers,
  }) async {
    if (_ticket == null) return;
    
    // Show loading
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
      // Direct ticket purchase - payment handled manually
      final res = await api.dio.post('/tickets/purchase', data: {'ticketId': _ticket!.id});
      
      // Close loading
      if (mounted) Navigator.pop(context);
      
      if (mounted) {
        if (_ticket!.price > 0) {
          // Paid ticket - show success dialog
          await _showSuccessDialog(
            title: 'Purchase Initiated!',
            message: 'Please complete the payment to confirm your ticket.',
            icon: Icons.payment,
          );
          
          // Navigate to manual payment screen
          final payment = res.data['data']['payment'];
          final paymentId = payment?['id'] ?? payment?['_id'];
          
          if (paymentId != null && mounted) {
            Navigator.of(context).pop(); // Close detail screen
            context.push('/manual-payment', extra: {
              'paymentId': paymentId,
              'amount': _ticket!.price,
              'metadata': 'Ticket: ${_ticket!.title}',
            });
          } else {
            // Show error with response details for debugging
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Payment created but ID missing. Please check My Tickets.'),
                backgroundColor: Colors.orange,
                duration: Duration(seconds: 4),
              ),
            );
            Navigator.of(context).pop();
          }
        } else {
          // Free ticket - show success
          await _showSuccessDialog(
            title: 'Success!',
            message: 'Free ticket acquired! Check "My Tickets" to view your ticket.',
            icon: Icons.check_circle,
            showViewTicketsButton: true,
          );
          Navigator.of(context).pop();
        }
      }
    } catch (e) {
      // Close loading
      if (mounted) Navigator.pop(context);
      
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
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline, size: 64, color: Colors.red.shade300),
                      const SizedBox(height: 16),
                      Text(_error!, style: const TextStyle(fontSize: 16)),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _fetchTicket,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _ticket == null
                  ? const Center(child: Text('Ticket not found'))
                  : CustomScrollView(
                      slivers: [
                        // App bar with image
                        SliverAppBar(
                          expandedHeight: 300,
                          pinned: true,
                          flexibleSpace: FlexibleSpaceBar(
                            title: Text(
                              _ticket!.title,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                shadows: [
                                  Shadow(
                                    color: Colors.black54,
                                    offset: Offset(0, 1),
                                    blurRadius: 4,
                                  ),
                                ],
                              ),
                            ),
                            background: _ticket!.coverImage != null && _ticket!.coverImage!.isNotEmpty
                                ? Stack(
                                    fit: StackFit.expand,
                                    children: [
                                      CachedNetworkImage(
                                        imageUrl: _ticket!.coverImage!,
                                        fit: BoxFit.cover,
                                        placeholder: (context, url) {
                                          print('Loading image: $url');
                                          return Container(
                                            color: Colors.grey.shade300,
                                            child: const Center(child: CircularProgressIndicator()),
                                          );
                                        },
                                        errorWidget: (context, url, error) {
                                          print('ERROR loading image: $url');
                                          print('Error: $error');
                                          return Container(
                                            color: Colors.grey.shade300,
                                            child: Column(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [
                                                const Icon(Icons.error, size: 48, color: Colors.red),
                                                const SizedBox(height: 8),
                                                Text('Failed: $url', style: const TextStyle(fontSize: 10)),
                                              ],
                                            ),
                                          );
                                        },
                                      ),
                                      Container(
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            begin: Alignment.topCenter,
                                            end: Alignment.bottomCenter,
                                            colors: [
                                              Colors.transparent,
                                              Colors.black.withValues(alpha: 0.7),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  )
                                : Container(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        colors: [
                                          Theme.of(context).colorScheme.primary,
                                          Theme.of(context).colorScheme.secondary,
                                        ],
                                      ),
                                    ),
                                    child: const Center(
                                      child: Icon(
                                        Icons.confirmation_number,
                                        size: 80,
                                        color: Colors.white70,
                                      ),
                                    ),
                                  ),
                          ),
                        ),
                        // Content
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Status badge
                                _buildStatusBadge(),
                                const SizedBox(height: 16),
                                
                                // Special Features Badges
                                if (_ticket!.hasVipOption || _ticket!.familyTicket || _ticket!.discount > 0)
                                  Wrap(
                                    spacing: 8,
                                    runSpacing: 8,
                                    children: [
                                      if (_ticket!.hasVipOption)
                                        Chip(
                                          avatar: const Icon(Icons.workspace_premium, color: Colors.purple, size: 18),
                                          label: const Text('VIP Available'),
                                          backgroundColor: Colors.purple.shade50,
                                          side: BorderSide(color: Colors.purple.shade200),
                                        ),
                                      if (_ticket!.familyTicket)
                                        Chip(
                                          avatar: const Icon(Icons.family_restroom, color: Colors.blue, size: 18),
                                          label: Text('Family (Max ${_ticket!.maxFamilyMembers})'),
                                          backgroundColor: Colors.blue.shade50,
                                          side: BorderSide(color: Colors.blue.shade200),
                                        ),
                                      if (_ticket!.discount > 0)
                                        Chip(
                                          avatar: const Icon(Icons.local_offer, color: Colors.green, size: 18),
                                          label: Text('${_ticket!.discount.toStringAsFixed(0)}% OFF'),
                                          backgroundColor: Colors.green.shade50,
                                          side: BorderSide(color: Colors.green.shade200),
                                        ),
                                    ],
                                  ),
                                if (_ticket!.hasVipOption || _ticket!.familyTicket || _ticket!.discount > 0)
                                  const SizedBox(height: 16),
                                
                                // Price Section
                                Card(
                                  elevation: 2,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        // Regular Price
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  'Regular Price',
                                                  style: TextStyle(
                                                    fontSize: 14,
                                                    color: Colors.grey,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  _ticket!.price > 0
                                                      ? 'ETB ${_ticket!.price.toStringAsFixed(2)}'
                                                      : 'FREE',
                                                  style: TextStyle(
                                                    fontSize: 24,
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.green.shade700,
                                                    decoration: _ticket!.discount > 0 
                                                        ? TextDecoration.lineThrough 
                                                        : null,
                                                  ),
                                                ),
                                                if (_ticket!.pointsReward > 0)
                                                  Text(
                                                    '+${_ticket!.pointsReward} points',
                                                    style: const TextStyle(
                                                      color: Colors.amber,
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 12,
                                                    ),
                                                  ),
                                              ],
                                            ),
                                            if (_ticket!.discount > 0)
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                decoration: BoxDecoration(
                                                  gradient: LinearGradient(
                                                    colors: [Colors.green.shade400, Colors.green.shade600],
                                                  ),
                                                  borderRadius: BorderRadius.circular(20),
                                                ),
                                                child: Text(
                                                  'SAVE ${_ticket!.discount.toStringAsFixed(0)}%',
                                                  style: const TextStyle(
                                                    color: Colors.white,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                              ),
                                          ],
                                        ),
                                        
                                        // VIP Price (if available)
                                        if (_ticket!.hasVipOption) ...[
                                          const Divider(height: 24),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Row(
                                                    children: [
                                                      Icon(Icons.workspace_premium, color: Colors.purple.shade600, size: 18),
                                                      const SizedBox(width: 4),
                                                      const Text(
                                                        'VIP Price',
                                                        style: TextStyle(
                                                          fontSize: 14,
                                                          color: Colors.purple,
                                                          fontWeight: FontWeight.w600,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    'ETB ${(_ticket!.vipPrice ?? _ticket!.price).toStringAsFixed(2)}',
                                                    style: TextStyle(
                                                      fontSize: 24,
                                                      fontWeight: FontWeight.bold,
                                                      color: Colors.purple.shade700,
                                                    ),
                                                  ),
                                                  Text(
                                                    '+${_ticket!.vipPoints} points',
                                                    style: const TextStyle(
                                                      color: Colors.amber,
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 12,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                decoration: BoxDecoration(
                                                  gradient: LinearGradient(
                                                    colors: [Colors.purple.shade400, Colors.purple.shade600],
                                                  ),
                                                  borderRadius: BorderRadius.circular(20),
                                                ),
                                                child: const Text(
                                                  'PREMIUM',
                                                  style: TextStyle(
                                                    color: Colors.white,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                        
                                        // Final Price After Discount
                                        if (_ticket!.discount > 0) ...[
                                          const Divider(height: 24),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              const Text(
                                                'After Discount',
                                                style: TextStyle(
                                                  fontSize: 14,
                                                  color: Colors.grey,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                              Text(
                                                'ETB ${(_ticket!.price * (1 - _ticket!.discount / 100)).toStringAsFixed(2)}',
                                                style: TextStyle(
                                                  fontSize: 20,
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.green.shade700,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 24),
                                
                                // Event Date & Location
                                _buildInfoRow(
                                  Icons.calendar_today,
                                  'Event Date',
                                  DateFormat('EEEE, MMMM d, y').format(_ticket!.eventDate),
                                ),
                                const SizedBox(height: 12),
                                
                                if (_ticket!.location != null)
                                  _buildInfoRow(
                                    Icons.location_on,
                                    'Location',
                                    _ticket!.location!,
                                  ),
                                const SizedBox(height: 24),
                                
                                // Availability
                                _buildAvailabilityCard(),
                                const SizedBox(height: 24),
                                
                                // Description
                                if (_ticket!.description != null && _ticket!.description!.isNotEmpty) ...[
                                  const Text(
                                    'About This Event',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    _ticket!.description!,
                                    style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey.shade700,
                                      height: 1.5,
                                    ),
                                  ),
                                  const SizedBox(height: 24),
                                ],
                                
                                // Purchase button
                                if (_ticket!.status == 'ACTIVE')
                                  SizedBox(
                                    width: double.infinity,
                                    child: FilledButton.icon(
                                      onPressed: _purchaseTicket,
                                      icon: const Icon(Icons.shopping_cart),
                                      label: Text(
                                        _ticket!.price > 0 ? 'Buy Ticket' : 'Get Free Ticket',
                                        style: const TextStyle(fontSize: 18),
                                      ),
                                      style: FilledButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(vertical: 16),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                      ),
                                    ),
                                  ),
                                const SizedBox(height: 32),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
    );
  }

  Widget _buildStatusBadge() {
    final colors = {
      'ACTIVE': Colors.green,
      'SOLD_OUT': Colors.red,
      'CANCELLED': Colors.grey,
    };
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: (colors[_ticket!.status] ?? Colors.grey).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: colors[_ticket!.status] ?? Colors.grey,
          width: 2,
        ),
      ),
      child: Text(
        _ticket!.status,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: colors[_ticket!.status],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 24, color: Theme.of(context).colorScheme.primary),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAvailabilityCard() {
    final available = _ticket!.quantity - _ticket!.soldCount;
    final percentage = _ticket!.quantity > 0 
        ? (_ticket!.soldCount / _ticket!.quantity * 100).toInt() 
        : 0;
    
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Availability',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '$available / ${_ticket!.quantity} left',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: available > 10 ? Colors.green : Colors.orange,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: _ticket!.quantity > 0 ? _ticket!.soldCount / _ticket!.quantity : 0,
                minHeight: 12,
                backgroundColor: Colors.grey.shade200,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              '$percentage% sold',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

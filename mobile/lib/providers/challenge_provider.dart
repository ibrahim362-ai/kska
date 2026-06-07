import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/challenge.dart';
import '../services/challenge_service.dart';
import 'auth_provider.dart';

// Challenge Service Provider
final challengeServiceProvider = Provider<ChallengeService>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return ChallengeService(apiService);
});

// Active Challenges Provider
final activeChallengesProvider = FutureProvider<List<Challenge>>((ref) async {
  final service = ref.watch(challengeServiceProvider);
  return service.getActiveChallenges();
});

// Challenge History Provider (with pagination)
final challengeHistoryProvider = FutureProvider.family<Map<String, dynamic>, int>((ref, page) async {
  final service = ref.watch(challengeServiceProvider);
  return service.getChallengeHistory(page: page);
});

// Challenge Response State Notifier (Riverpod 3.x syntax)
class ChallengeResponseNotifier extends Notifier<AsyncValue<ChallengeResponse?>> {
  @override
  AsyncValue<ChallengeResponse?> build() {
    return const AsyncValue.data(null);
  }

  Future<void> respondToChallenge({
    required String challengeId,
    required String action,
    String? content,
    String? mediaUrl,
  }) async {
    state = const AsyncValue.loading();
    
    try {
      final service = ref.read(challengeServiceProvider);
      final response = await service.respondToChallenge(
        challengeId: challengeId,
        action: action,
        content: content,
        mediaUrl: mediaUrl,
      );
      
      state = AsyncValue.data(response);
      
      // Refresh active challenges list after responding
      ref.invalidate(activeChallengesProvider);
      
      // NOTE: Points are not automatically awarded
      // Admin will manually add points after reviewing the response
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }

  void reset() {
    state = const AsyncValue.data(null);
  }
}

final challengeResponseProvider = NotifierProvider<ChallengeResponseNotifier, AsyncValue<ChallengeResponse?>>(() {
  return ChallengeResponseNotifier();
});

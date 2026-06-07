import 'package:dio/dio.dart';
import '../models/challenge.dart';
import 'api_service.dart';

class ChallengeService {
  final ApiService _apiService;

  ChallengeService(this._apiService);

  // Get active challenges (challenges user hasn't responded to)
  Future<List<Challenge>> getActiveChallenges() async {
    try {
      final response = await _apiService.dio.get('/challenges/active');
      
      if (response.data['success'] == true) {
        final List<dynamic> data = response.data['data'] as List<dynamic>;
        return data.map((json) => Challenge.fromJson(json as Map<String, dynamic>)).toList();
      }
      
      throw Exception('Failed to fetch active challenges');
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? 'Failed to fetch challenges');
    }
  }

  // Get user's challenge history
  Future<Map<String, dynamic>> getChallengeHistory({int page = 1, int limit = 20}) async {
    try {
      final response = await _apiService.dio.get(
        '/challenges/history',
        queryParameters: {'page': page, 'limit': limit},
      );
      
      if (response.data['success'] == true) {
        final data = response.data['data'];
        final List<dynamic> responsesData = data['responses'] as List<dynamic>;
        final responses = responsesData
            .map((json) => ChallengeResponse.fromJson(json as Map<String, dynamic>))
            .toList();
        
        return {
          'responses': responses,
          'pagination': data['pagination'],
        };
      }
      
      throw Exception('Failed to fetch challenge history');
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? 'Failed to fetch history');
    }
  }

  // Respond to a challenge (ACCEPT, REJECT, or SKIP)
  Future<ChallengeResponse> respondToChallenge({
    required String challengeId,
    required String action, // ACCEPT, REJECT, SKIP
    String? content,
    String? mediaUrl,
  }) async {
    try {
      final response = await _apiService.dio.post(
        '/challenges/$challengeId/respond',
        data: {
          'action': action,
          if (content != null) 'content': content,
          if (mediaUrl != null) 'mediaUrl': mediaUrl,
        },
      );
      
      if (response.data['success'] == true) {
        return ChallengeResponse.fromJson(response.data['data'] as Map<String, dynamic>);
      }
      
      throw Exception('Failed to respond to challenge');
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? 'Failed to respond to challenge');
    }
  }

  // Accept challenge (convenience method)
  Future<ChallengeResponse> acceptChallenge(String challengeId) {
    return respondToChallenge(challengeId: challengeId, action: 'ACCEPT');
  }

  // Reject challenge (convenience method)
  Future<ChallengeResponse> rejectChallenge(String challengeId) {
    return respondToChallenge(challengeId: challengeId, action: 'REJECT');
  }

  // Skip challenge (convenience method)
  Future<ChallengeResponse> skipChallenge(String challengeId) {
    return respondToChallenge(challengeId: challengeId, action: 'SKIP');
  }
}

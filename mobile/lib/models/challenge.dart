class Challenge {
  final String id;
  final String title;
  final String description;
  final String type;
  final String? imageUrl;
  final int points;
  final DateTime startsAt;
  final DateTime endsAt;
  final bool isActive;
  final int? maxResponses;
  final int totalResponses;
  final int acceptCount;
  final int rejectCount;
  final int skipCount;
  final ChallengeCreator creator;
  final DateTime createdAt;

  Challenge({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    this.imageUrl,
    required this.points,
    required this.startsAt,
    required this.endsAt,
    required this.isActive,
    this.maxResponses,
    required this.totalResponses,
    required this.acceptCount,
    required this.rejectCount,
    required this.skipCount,
    required this.creator,
    required this.createdAt,
  });

  factory Challenge.fromJson(Map<String, dynamic> json) {
    return Challenge(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      type: json['type'] as String,
      imageUrl: json['imageUrl'] as String?,
      points: json['points'] as int,
      startsAt: DateTime.parse(json['startsAt'] as String),
      endsAt: DateTime.parse(json['endsAt'] as String),
      isActive: json['isActive'] as bool,
      maxResponses: json['maxResponses'] as int?,
      totalResponses: json['totalResponses'] as int,
      acceptCount: json['acceptCount'] as int,
      rejectCount: json['rejectCount'] as int,
      skipCount: json['skipCount'] as int,
      creator: ChallengeCreator.fromJson(json['creator'] as Map<String, dynamic>),
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type,
      'imageUrl': imageUrl,
      'points': points,
      'startsAt': startsAt.toIso8601String(),
      'endsAt': endsAt.toIso8601String(),
      'isActive': isActive,
      'maxResponses': maxResponses,
      'totalResponses': totalResponses,
      'acceptCount': acceptCount,
      'rejectCount': rejectCount,
      'skipCount': skipCount,
      'creator': creator.toJson(),
      'createdAt': createdAt.toIso8601String(),
    };
  }

  bool get isExpired => DateTime.now().isAfter(endsAt);
  bool get isStarted => DateTime.now().isAfter(startsAt);
  bool get isValid => isActive && isStarted && !isExpired;
  
  String get timeRemaining {
    if (isExpired) return 'Expired';
    final diff = endsAt.difference(DateTime.now());
    if (diff.inDays > 0) return '${diff.inDays}d left';
    if (diff.inHours > 0) return '${diff.inHours}h left';
    if (diff.inMinutes > 0) return '${diff.inMinutes}m left';
    return 'Ending soon';
  }
}

class ChallengeCreator {
  final String id;
  final String username;
  final String fullName;
  final String? avatar;

  ChallengeCreator({
    required this.id,
    required this.username,
    required this.fullName,
    this.avatar,
  });

  factory ChallengeCreator.fromJson(Map<String, dynamic> json) {
    return ChallengeCreator(
      id: json['id'] as String,
      username: json['username'] as String,
      fullName: json['fullName'] as String,
      avatar: json['avatar'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'fullName': fullName,
      'avatar': avatar,
    };
  }
}

class ChallengeResponse {
  final String id;
  final String challengeId;
  final String userId;
  final String action; // ACCEPT, REJECT, SKIP
  final String? content;
  final String? mediaUrl;
  final DateTime createdAt;
  final Challenge? challenge;

  ChallengeResponse({
    required this.id,
    required this.challengeId,
    required this.userId,
    required this.action,
    this.content,
    this.mediaUrl,
    required this.createdAt,
    this.challenge,
  });

  factory ChallengeResponse.fromJson(Map<String, dynamic> json) {
    return ChallengeResponse(
      id: json['id'] as String,
      challengeId: json['challengeId'] as String,
      userId: json['userId'] as String,
      action: json['action'] as String,
      content: json['content'] as String?,
      mediaUrl: json['mediaUrl'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      challenge: json['challenge'] != null
          ? Challenge.fromJson(json['challenge'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'challengeId': challengeId,
      'userId': userId,
      'action': action,
      'content': content,
      'mediaUrl': mediaUrl,
      'createdAt': createdAt.toIso8601String(),
      if (challenge != null) 'challenge': challenge!.toJson(),
    };
  }

  bool get isAccepted => action == 'ACCEPT';
  bool get isRejected => action == 'REJECT';
  bool get isSkipped => action == 'SKIP';
}

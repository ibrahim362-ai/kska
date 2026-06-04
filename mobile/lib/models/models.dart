class User {
  final String id;
  final String email;
  final String username;
  final String fullName;
  final String? avatar;
  final String? bio;
  final String? phone;
  final String role;
  final bool isVerified;
  final bool isBanned;
  final DateTime createdAt;

  User({
    required this.id,
    required this.email,
    required this.username,
    required this.fullName,
    this.avatar,
    this.bio,
    this.phone,
    required this.role,
    required this.isVerified,
    required this.isBanned,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'],
    email: json['email'],
    username: json['username'],
    fullName: json['fullName'],
    avatar: json['avatar'],
    bio: json['bio'],
    phone: json['phone'],
    role: json['role'],
    isVerified: json['isVerified'] ?? false,
    isBanned: json['isBanned'] ?? false,
    createdAt: json['createdAt'] != null
        ? DateTime.parse(json['createdAt'])
        : DateTime.now(),
  );

  User copyWith({
    String? id,
    String? email,
    String? username,
    String? fullName,
    String? avatar,
    String? bio,
    String? phone,
    String? role,
    bool? isVerified,
    bool? isBanned,
    DateTime? createdAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      username: username ?? this.username,
      fullName: fullName ?? this.fullName,
      avatar: avatar ?? this.avatar,
      bio: bio ?? this.bio,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      isVerified: isVerified ?? this.isVerified,
      isBanned: isBanned ?? this.isBanned,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}

class Post {
  final String id;
  final String userId;
  final String type;
  final String? title;
  final String? content;
  final String? mediaUrl;
  final String? hashtags;
  final int viewCount;
  final int likeCount;
  final int commentCount;
  final DateTime createdAt;
  final User user;

  Post({
    required this.id,
    required this.userId,
    required this.type,
    this.title,
    this.content,
    this.mediaUrl,
    this.hashtags,
    required this.viewCount,
    required this.likeCount,
    required this.commentCount,
    required this.createdAt,
    required this.user,
  });

  factory Post.fromJson(Map<String, dynamic> json) => Post(
    id: json['id'],
    userId: json['userId'],
    type: json['type'],
    title: json['title'],
    content: json['content'],
    mediaUrl: json['mediaUrl'],
    hashtags: json['hashtags'],
    viewCount: json['viewCount'] ?? 0,
    likeCount: json['_count']?['likes'] ?? 0,
    commentCount: json['_count']?['comments'] ?? 0,
    createdAt: DateTime.parse(json['createdAt']),
    user: User.fromJson(json['user']),
  );

  Post copyWith({
    String? id,
    String? userId,
    String? type,
    String? content,
    String? mediaUrl,
    String? hashtags,
    int? viewCount,
    int? likeCount,
    int? commentCount,
    DateTime? createdAt,
    User? user,
  }) {
    return Post(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      type: type ?? this.type,
      content: content ?? this.content,
      mediaUrl: mediaUrl ?? this.mediaUrl,
      hashtags: hashtags ?? this.hashtags,
      viewCount: viewCount ?? this.viewCount,
      likeCount: likeCount ?? this.likeCount,
      commentCount: commentCount ?? this.commentCount,
      createdAt: createdAt ?? this.createdAt,
      user: user ?? this.user,
    );
  }
}

class Vote {
  final String id;
  final String title;
  final String? description;
  final String voteType;
  final DateTime startsAt;
  final DateTime endsAt;
  final bool isActive;
  final int totalVotes;
  final List<VoteOption> options;

  Vote({
    required this.id,
    required this.title,
    this.description,
    required this.voteType,
    required this.startsAt,
    required this.endsAt,
    required this.isActive,
    required this.totalVotes,
    required this.options,
  });

  factory Vote.fromJson(Map<String, dynamic> json) => Vote(
    id: json['id'],
    title: json['title'],
    description: json['description'],
    voteType: json['voteType'],
    startsAt: DateTime.parse(json['startsAt']),
    endsAt: DateTime.parse(json['endsAt']),
    isActive: json['isActive'] ?? false,
    totalVotes: json['totalVotes'] ?? 0,
    options: (json['options'] as List)
        .map((o) => VoteOption.fromJson(o))
        .toList(),
  );
}

class VoteOption {
  final String id;
  final String text;
  final int voteCount;

  VoteOption({required this.id, required this.text, required this.voteCount});

  factory VoteOption.fromJson(Map<String, dynamic> json) => VoteOption(
    id: json['id'],
    text: json['text'],
    voteCount: json['voteCount'] ?? 0,
  );
}

class Membership {
  final String id;
  final String name;
  final String planType;
  final double price;
  final int duration;
  final int extraVotes;
  final bool priorityTicket;
  final double leaderboardBoost;

  Membership({
    required this.id,
    required this.name,
    required this.planType,
    required this.price,
    required this.duration,
    required this.extraVotes,
    required this.priorityTicket,
    required this.leaderboardBoost,
  });

  factory Membership.fromJson(Map<String, dynamic> json) => Membership(
    id: json['id'],
    name: json['name'],
    planType: json['planType'],
    price: (json['price'] ?? 0).toDouble(),
    duration: json['duration'] ?? 30,
    extraVotes: json['extraVotes'] ?? 0,
    priorityTicket: json['priorityTicket'] ?? false,
    leaderboardBoost: (json['leaderboardBoost'] ?? 1.0).toDouble(),
  );
}

class TicketModel {
  final String id;
  final String title;
  final String? description;
  final double price;
  final int quantity;
  final int soldCount;
  final DateTime eventDate;
  final String? location;
  final String status;

  TicketModel({
    required this.id,
    required this.title,
    this.description,
    required this.price,
    required this.quantity,
    required this.soldCount,
    required this.eventDate,
    this.location,
    required this.status,
  });

  factory TicketModel.fromJson(Map<String, dynamic> json) => TicketModel(
    id: json['id'],
    title: json['title'],
    description: json['description'],
    price: (json['price'] ?? 0).toDouble(),
    quantity: json['quantity'] ?? 0,
    soldCount: json['soldCount'] ?? 0,
    eventDate: DateTime.parse(json['eventDate']),
    location: json['location'],
    status: json['status'],
  );
}

class LeaderboardEntry {
  final int rank;
  final int score;
  final User user;

  LeaderboardEntry({
    required this.rank,
    required this.score,
    required this.user,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) =>
      LeaderboardEntry(
        rank: json['rank'],
        score: json['score'],
        user: User.fromJson(json['user']),
      );
}

class NotificationModel {
  final String id;
  final String type;
  final String title;
  final String message;
  final bool isRead;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) =>
      NotificationModel(
        id: json['id'],
        type: json['type'],
        title: json['title'],
        message: json['message'],
        isRead: json['isRead'] ?? false,
        createdAt: DateTime.parse(json['createdAt']),
      );
}

class Comment {
  final String id;
  final String postId;
  final String userId;
  final String content;
  final DateTime createdAt;
  final User user;

  Comment({
    required this.id,
    required this.postId,
    required this.userId,
    required this.content,
    required this.createdAt,
    required this.user,
  });

  factory Comment.fromJson(Map<String, dynamic> json) => Comment(
    id: json['id'],
    postId: json['postId'],
    userId: json['userId'],
    content: json['content'],
    createdAt: DateTime.parse(json['createdAt']),
    user: User.fromJson(json['user']),
  );
}

// ====================================================================
// Manual Payment
// ====================================================================

class BankAccountInfo {
  final String? bankName;
  final String? accountNumber;
  final String? accountHolder;
  final String? number;

  BankAccountInfo({this.bankName, this.accountNumber, this.accountHolder, this.number});

  factory BankAccountInfo.fromJson(Map<String, dynamic> json) => BankAccountInfo(
    bankName: json['bankName'],
    accountNumber: json['accountNumber'],
    accountHolder: json['accountHolder'],
    number: json['number'],
  );
}

class ManualPaymentInstructions {
  final String instructions;
  final BankAccounts accounts;
  final String currency;

  ManualPaymentInstructions({required this.instructions, required this.accounts, required this.currency});

  factory ManualPaymentInstructions.fromJson(Map<String, dynamic> json) => ManualPaymentInstructions(
    instructions: json['instructions'] ?? '',
    currency: json['currency'] ?? 'ETB',
    accounts: BankAccounts.fromJson(json['accounts'] ?? {}),
  );
}

class BankAccounts {
  final BankAccountInfo? bank;
  final BankAccountInfo? telebirr;
  final BankAccountInfo? awash;

  BankAccounts({this.bank, this.telebirr, this.awash});

  factory BankAccounts.fromJson(Map<String, dynamic> json) => BankAccounts(
    bank: json['bank'] != null ? BankAccountInfo.fromJson(json['bank']) : null,
    telebirr: json['telebirr'] != null ? BankAccountInfo.fromJson(json['telebirr']) : null,
    awash: json['awash'] != null ? BankAccountInfo.fromJson(json['awash']) : null,
  );
}

class ManualPaymentProof {
  final String id;
  final String paymentId;
  final String status;
  final String? rejectionReason;
  final DateTime createdAt;

  ManualPaymentProof({
    required this.id,
    required this.paymentId,
    required this.status,
    this.rejectionReason,
    required this.createdAt,
  });

  factory ManualPaymentProof.fromJson(Map<String, dynamic> json) => ManualPaymentProof(
    id: json['id'],
    paymentId: json['paymentId'],
    status: json['status'],
    rejectionReason: json['rejectionReason'],
    createdAt: DateTime.parse(json['createdAt']),
  );
}

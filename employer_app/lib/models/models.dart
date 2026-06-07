class TicketModel {
  final String id;
  final String title;
  final String? description;
  final String? coverImage;
  final double price;
  final int quantity;
  final int soldCount;
  final DateTime eventDate;
  final String? location;
  final String status;
  final String? qrCode;

  TicketModel({
    required this.id,
    required this.title,
    this.description,
    this.coverImage,
    required this.price,
    required this.quantity,
    required this.soldCount,
    required this.eventDate,
    this.location,
    required this.status,
    this.qrCode,
  });

  factory TicketModel.fromJson(Map<String, dynamic> json) => TicketModel(
    id: json['id'],
    title: json['title'],
    description: json['description'],
    coverImage: json['coverImage'],
    price: (json['price'] ?? 0).toDouble(),
    quantity: json['quantity'] ?? 0,
    soldCount: json['soldCount'] ?? 0,
    eventDate: DateTime.parse(json['eventDate']),
    location: json['location'],
    status: json['status'],
    qrCode: json['qrCode'],
  );
}

class TicketPurchase {
  final String id;
  final String ticketId;
  final String userId;
  final String status;
  final String? qrCode;
  final String? seatNumber;
  final bool checkedIn;
  final DateTime? checkedInAt;
  final DateTime createdAt;
  final TicketModel? ticket;
  final Map<String, dynamic>? user;

  TicketPurchase({
    required this.id,
    required this.ticketId,
    required this.userId,
    required this.status,
    this.qrCode,
    this.seatNumber,
    required this.checkedIn,
    this.checkedInAt,
    required this.createdAt,
    this.ticket,
    this.user,
  });

  factory TicketPurchase.fromJson(Map<String, dynamic> json) => TicketPurchase(
    id: json['id'],
    ticketId: json['ticketId'],
    userId: json['userId'],
    status: json['status'],
    qrCode: json['qrCode'],
    seatNumber: json['seatNumber'],
    checkedIn: json['checkedIn'] ?? false,
    checkedInAt: json['checkedInAt'] != null
        ? DateTime.parse(json['checkedInAt'])
        : null,
    createdAt: DateTime.parse(json['createdAt']),
    ticket: json['ticket'] != null
        ? TicketModel.fromJson(json['ticket'])
        : null,
    user: json['user']?['fullName'] != null
        ? {'fullName': json['user']['fullName'], 'email': json['user']['email']}
        : null,
  );
}

class Post {
  final String id;
  final String type;
  final String? title;
  final String? content;
  final int likeCount;
  final int commentCount;
  final int viewCount;
  final DateTime createdAt;

  Post({
    required this.id,
    required this.type,
    this.title,
    this.content,
    required this.likeCount,
    required this.commentCount,
    required this.viewCount,
    required this.createdAt,
  });

  factory Post.fromJson(Map<String, dynamic> json) => Post(
    id: json['id'],
    type: json['type'],
    title: json['title'],
    content: json['content'],
    likeCount: json['_count']?['likes'] ?? 0,
    commentCount: json['_count']?['comments'] ?? 0,
    viewCount: json['viewCount'] ?? 0,
    createdAt: DateTime.parse(json['createdAt']),
  );
}

class Vote {
  final String id;
  final String title;
  final int totalVotes;
  final bool isActive;
  final DateTime endsAt;

  Vote({
    required this.id,
    required this.title,
    required this.totalVotes,
    required this.isActive,
    required this.endsAt,
  });

  factory Vote.fromJson(Map<String, dynamic> json) => Vote(
    id: json['id'],
    title: json['title'],
    totalVotes: json['totalVotes'] ?? 0,
    isActive: json['isActive'] ?? false,
    endsAt: DateTime.parse(json['endsAt']),
  );
}

class DashboardStats {
  final int totalTickets;
  final int totalCheckIns;
  final int totalPosts;
  final int totalVotes;
  final double revenue;
  final List<TicketModel> recentTickets;
  final List<TicketPurchase> recentCheckIns;

  DashboardStats({
    required this.totalTickets,
    required this.totalCheckIns,
    required this.totalPosts,
    required this.totalVotes,
    required this.revenue,
    required this.recentTickets,
    required this.recentCheckIns,
  });
}

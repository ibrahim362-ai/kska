import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:image_picker/image_picker.dart';
import '../models/models.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  late final Dio dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    print('ApiService initialized with baseUrl: $baseUrl');
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30), // Increased for email sending
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'accessToken');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final refreshToken = await _storage.read(key: 'refreshToken');
          if (refreshToken != null) {
            try {
              final response = await Dio(BaseOptions(baseUrl: baseUrl))
                  .post('/auth/refresh-token', data: {'refreshToken': refreshToken});
              final newAccess = response.data['data']['accessToken'];
              final newRefresh = response.data['data']['refreshToken'];
              await _storage.write(key: 'accessToken', value: newAccess);
              await _storage.write(key: 'refreshToken', value: newRefresh);
              error.requestOptions.headers['Authorization'] = 'Bearer $newAccess';
              final retryResponse = await dio.fetch(error.requestOptions);
              return handler.resolve(retryResponse);
            } catch (_) {
              await _storage.deleteAll();
            }
          }
        }
        handler.next(error);
      },
    ));
  }

  Future<void> saveTokens(String access, String refresh) async {
    await _storage.write(key: 'accessToken', value: access);
    await _storage.write(key: 'refreshToken', value: refresh);
  }

  // ====================================================================
  // Manual Payments
  // ====================================================================

  Future<ManualPaymentInstructions> getManualPaymentInstructions() async {
    final response = await dio.get('/manual-payments/instructions');
    return ManualPaymentInstructions.fromJson(response.data['data']);
  }

  Future<Map<String, dynamic>> createPayment({
    required double amount,
    String currency = 'ETB',
    String? metadata,
  }) async {
    final response = await dio.post('/payments', data: {
      'amount': amount,
      'currency': currency,
      'method': 'MANUAL',
      'metadata': metadata,
    });
    return response.data['data'];
  }

  Future<ManualPaymentProof> submitManualProof({
    required String paymentId,
    required XFile receiptFile,
    required String senderName,
    String? senderPhone,
    String? transactionRef,
    required DateTime paidAt,
    String? notes,
  }) async {
    // Create MultipartFile based on platform
    MultipartFile receiptMultipart;
    if (kIsWeb) {
      // Web: Use bytes
      final bytes = await receiptFile.readAsBytes();
      receiptMultipart = MultipartFile.fromBytes(
        bytes,
        filename: receiptFile.name,
      );
    } else {
      // Mobile/Desktop: Use file path
      receiptMultipart = await MultipartFile.fromFile(
        receiptFile.path,
        filename: 'receipt.jpg',
      );
    }

    final formData = FormData.fromMap({
      'receipt': receiptMultipart,
      'senderName': senderName,
      if (senderPhone != null && senderPhone.isNotEmpty) 'senderPhone': senderPhone,
      if (transactionRef != null && transactionRef.isNotEmpty) 'transactionRef': transactionRef,
      'paidAt': paidAt.toIso8601String(),
      if (notes != null && notes.isNotEmpty) 'notes': notes,
    });

    final response = await dio.post(
      '/manual-payments/$paymentId/proof',
      data: formData,
      options: Options(contentType: 'multipart/form-data'),
    );
    return ManualPaymentProof.fromJson(response.data['data']);
  }

  Future<List<ManualPaymentProof>> getMyPaymentProofs() async {
    final response = await dio.get('/manual-payments/proofs/my');
    return (response.data['data'] as List)
        .map((json) => ManualPaymentProof.fromJson(json))
        .toList();
  }
}

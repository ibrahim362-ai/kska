import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  late final Dio dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _storage.read(key: 'accessToken');
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final rt = await _storage.read(key: 'refreshToken');
          if (rt != null) {
            try {
              final r = await Dio(BaseOptions(baseUrl: baseUrl)).post('/auth/refresh-token', data: {'refreshToken': rt});
              await _storage.write(key: 'accessToken', value: r.data['data']['accessToken']);
              await _storage.write(key: 'refreshToken', value: r.data['data']['refreshToken']);
              error.requestOptions.headers['Authorization'] = 'Bearer ${r.data['data']['accessToken']}';
              return handler.resolve(await dio.fetch(error.requestOptions));
            } catch (_) { await _storage.deleteAll(); }
          }
        }
        handler.next(error);
      },
    ));
  }

  Future<void> saveTokens(String a, String r) async {
    await _storage.write(key: 'accessToken', value: a);
    await _storage.write(key: 'refreshToken', value: r);
  }
}

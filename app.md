# Cheongrium App — System Architecture
## Flutter App with Saju-Hancom Code Reuse

---

# 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CHEONGRIUM APP ARCHITECTURE                             │
│                 Flutter App + Reused saju-hancom Codebase                    │
└─────────────────────────────────────────────────────────────────────────────┘

                              CHEONGRIUM APP (Flutter)
    ┌────────────────────────────────────────────────────────────────────────┐
    │                                                                        │
    │         ┌──────────────────────────────────────────────────┐          │
    │         │              FLUTTER MOBILE APP                   │          │
    │         │                                                   │          │
    │         │   ┌──────────────┐      ┌──────────────┐         │          │
    │         │   │     iOS      │      │   Android    │         │          │
    │         │   └──────────────┘      └──────────────┘         │          │
    │         │                                                   │          │
    │         │   • 사주 분석 (코드 재활용)                       │          │
    │         │   • 현장 수호신 체험                              │          │
    │         │   • GPS 기반 오디오 투어                          │          │
    │         │   • 실시간 음성 대화                              │          │
    │         │   • 오프라인 콘텐츠                               │          │
    │         └───────────────────────────┬──────────────────────┘          │
    │                                     │                                  │
    └─────────────────────────────────────┼──────────────────────────────────┘
                                          │
                 ┌────────────────────────┴────────────────────────┐
                 │           NEXT.JS BACKEND (saju-hancom)         │
                 │           Deployed: cheongrium.vercel.app       │
                 │                                                 │
                 │  /api/saju/*        ──────▶ Saju Pipeline       │
                 │  /api/compatibility/*      (6-step Gemini)      │
                 │  /api/face-reading/*                            │
                 │  /api/voice/*       ──────▶ Voice Sidecar       │
                 │  /api/cheongrium/*  ──────▶ NEW: 현장 체험      │
                 │  /api/stripe/*                                  │
                 │                                                 │
                 └────────────────────────┬────────────────────────┘
                                          │
                              ┌───────────┴───────────┐
                              │       SUPABASE        │
                              │   (ypwvlmhdqavb)      │
                              │                       │
                              │  • Auth (OAuth)       │
                              │  • PostgreSQL         │
                              │  • Realtime           │
                              │  • Storage            │
                              │  • Edge Fn            │
                              └───────────┬───────────┘
                                          │
                        ┌─────────────────┼─────────────────┐
                        │                 │                 │
                   ┌────┴────┐      ┌─────┴─────┐     ┌────┴────┐
                   │ Gemini  │      │  Cartesia │     │  Groq   │
                   │ (LLM)   │      │  (TTS)    │     │  (STT)  │
                   └─────────┘      └───────────┘     └─────────┘
```

---

# 2. Existing Code to Reuse (saju-hancom repo)

## 2.1 Saju Engine (`lib/saju/`)

| File | Reuse for Cheongrium |
|------|---------------------|
| `calculator.ts` | 사주 계산 (이미 완성됨) |
| `pipeline-orchestrator.ts` | 6단계 AI 분석 파이프라인 |
| `pipeline-steps.ts` | Step 1-6 분석 함수들 |
| `pipeline-schemas.ts` | Zod 스키마 (타입 검증) |
| `elements.ts` | 오행 점수 계산 |
| `ten-gods.ts` | 십성 계산 |
| `stars.ts` | 신살 계산 |
| `agents/*.ts` | 나이별/차트/시간 에이전트 |

**재활용 방법**: Flutter 앱에서 saju-hancom 백엔드의 `/api/saju/analyze/stream` 호출

## 2.2 Voice Infrastructure (`voice-sidecar/`)

| File | Reuse for Cheongrium |
|------|---------------------|
| `services/cartesia-ws.ts` | 스트리밍 TTS (한사 음성) |
| `services/pipeline.ts` | STT → LLM → TTS 파이프라인 |
| `routes/ws.ts` | WebSocket 핸들러 |
| `utils/text-chunker.ts` | 문장 단위 청킹 |
| `constants.ts` | 오디오 설정 (16kHz PCM) |

**재활용 방법**: Flutter WebSocket → voice-sidecar (Fly.io) 직접 연결

## 2.3 API Routes (`app/api/`)

| Endpoint | 기능 | Flutter 연동 |
|----------|------|-------------|
| `POST /api/saju/analyze/stream` | SSE 스트리밍 분석 | EventSource 연결 |
| `POST /api/voice/session` | 음성 세션 생성 | sessionId + wsUrl 획득 |
| `POST /api/compatibility/analyze` | 궁합 분석 | JSON 응답 |
| `POST /api/face-reading/analyze` | 관상 분석 | JSON + 이미지 |
| `GET /api/saju/result/[id]` | 분석 결과 조회 | JSON 응답 |

## 2.4 Database Schema (Supabase)

```sql
-- 기존 테이블 (재활용)
• saju_analyses      -- 사주 분석 결과
• compatibility      -- 궁합 분석 결과
• conversations      -- 대화 히스토리
• face_readings      -- 관상 분석 결과
• profiles           -- 사용자 프로필
• subscriptions      -- Stripe 구독

-- 신규 테이블 (청리움 현장용)
• cr_bookings        -- 청리움 예약
• cr_location_visits -- 위치 방문 로그
• cr_scent_orders    -- 데스티니 향 주문
```

---

# 3. New API Routes for Cheongrium On-Site Experience

## 3.1 Location-Based Content API

```typescript
// app/api/cheongrium/locations/route.ts
// GET: 청리움 위치 POI 목록 (geofence 데이터 포함)

interface LocationPOI {
  id: string;
  name: string;
  nameHanja: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number;
  guardianId: string;        // 'hwangryong' | 'baekho' | 'hyeonmu' | 'cheongryong' | 'jujak'
  audioIntroUrl: string;     // Pre-recorded intro audio
  audioScriptUrl: string;    // Fallback TTS script
  description: string;
  elementConnection: string; // 오행 연결 설명
}

// 응답: LocationPOI[] (오프라인 캐싱용)
```

## 3.2 Guardian Voice Session API

```typescript
// app/api/cheongrium/guardian-session/route.ts
// POST: 수호신 음성 세션 생성 (기존 voice/session 확장)

interface GuardianSessionRequest {
  guardianId: string;
  locationId?: string;
  sajuProfileId: string;     // 사용자 사주 분석 ID
  locale: string;
}

interface GuardianSessionResponse {
  sessionId: string;
  wsUrl: string;             // 기존 voice sidecar 사용
  greeting: string;          // 수호신 인사말
  guardianVoiceId: string;   // Cartesia voice ID
}

// 수호신별 시스템 프롬프트 생성 로직 추가
```

## 3.3 Destiny Scent Recommendation API

```typescript
// app/api/cheongrium/destiny-scent/route.ts
// POST: 사주 기반 향 추천 (Gemini)

interface DestinyScentRequest {
  sajuProfileId: string;
  sasangType?: string;       // 사상체질
}

interface DestinyScentResponse {
  formula: {
    topNotes: string[];      // 탑 노트 원료
    middleNotes: string[];   // 미들 노트 원료
    baseNotes: string[];     // 베이스 노트 원료
  };
  elementBalance: string;    // 오행 균형 설명
  personalMessage: string;   // AI 생성 메시지
  scentName: string;         // AI 생성 이름
}
```

## 3.4 Booking Integration API

```typescript
// app/api/cheongrium/booking/route.ts
// POST: 예약 생성 + 맞춤 일정 생성

interface BookingRequest {
  userId: string;
  checkIn: string;           // ISO date
  checkOut: string;
  packageType: 'day_course' | 'overnight' | 'vip';
  sajuProfileId?: string;    // 사주 분석이 있는 경우
}

interface BookingResponse {
  bookingId: string;
  itinerary: ItineraryItem[]; // AI 생성 맞춤 일정
  primaryGuardian: string;
  recommendedLocations: string[];
}

interface ItineraryItem {
  time: string;
  location: string;
  activity: string;
  guardianMessage: string;
  duration: number;          // minutes
}
```

---

# 4. Flutter App Architecture

## 4.1 Simplified Project Structure

```
cheongrium_app/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   │
│   ├── core/
│   │   ├── config/
│   │   │   ├── api_config.dart       # Backend API endpoints
│   │   │   └── supabase_config.dart  # Same Supabase project
│   │   ├── constants/
│   │   │   ├── guardians.dart        # 5 Guardian definitions
│   │   │   └── geofences.dart        # GPS trigger zones
│   │   └── theme/
│   │       └── app_theme.dart
│   │
│   ├── data/
│   │   ├── models/
│   │   │   ├── saju_analysis.dart    # From /api/saju/result
│   │   │   ├── guardian.dart
│   │   │   ├── location_poi.dart
│   │   │   └── booking.dart
│   │   ├── repositories/
│   │   │   ├── saju_repository.dart   # Calls saju-hancom backend APIs
│   │   │   ├── guardian_repository.dart
│   │   │   └── booking_repository.dart
│   │   └── sources/
│   │       ├── api_client.dart        # HTTP client for saju-hancom backend
│   │       └── voice_ws_client.dart   # WebSocket for voice sidecar
│   │
│   ├── presentation/
│   │   ├── providers/                 # Riverpod
│   │   ├── screens/
│   │   │   ├── home/
│   │   │   ├── guardian_chat/         # Voice conversation
│   │   │   ├── audio_tour/            # GPS-triggered audio
│   │   │   └── destiny_scent/
│   │   └── widgets/
│   │
│   └── services/
│       ├── location_service.dart      # GPS + Geofencing
│       ├── audio_service.dart         # Background playback
│       └── offline_service.dart
│
├── assets/
│   ├── audio/guardians/               # Pre-recorded guardian audio
│   └── images/
└── pubspec.yaml
```

## 4.2 API Client (saju-hancom 백엔드 연결)

```dart
// lib/data/sources/api_client.dart

class CheongriuumApiClient {
  static const String baseUrl = 'https://cheongrium.vercel.app/api';
  final Dio _dio;
  final SupabaseClient _supabase;

  CheongriuumApiClient(this._supabase) : _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: Duration(seconds: 10),
  ));

  /// 인증 헤더 추가
  Future<Options> _authOptions() async {
    final session = _supabase.auth.currentSession;
    return Options(headers: {
      if (session != null) 'Authorization': 'Bearer ${session.accessToken}',
    });
  }

  /// 사주 분석 결과 조회
  Future<SajuAnalysis?> getSajuAnalysis(String analysisId) async {
    final response = await _dio.get(
      '/saju/result/$analysisId',
      options: await _authOptions(),
    );
    return SajuAnalysis.fromJson(response.data);
  }

  /// 청리움 위치 POI 조회 (오프라인 캐싱용)
  Future<List<LocationPOI>> getLocationPOIs() async {
    final response = await _dio.get('/cheongrium/locations');
    return (response.data as List)
        .map((e) => LocationPOI.fromJson(e))
        .toList();
  }

  /// 수호신 음성 세션 생성
  Future<GuardianSession> createGuardianSession({
    required String guardianId,
    required String sajuProfileId,
    String? locationId,
    String locale = 'ko',
  }) async {
    final response = await _dio.post(
      '/cheongrium/guardian-session',
      data: {
        'guardianId': guardianId,
        'sajuProfileId': sajuProfileId,
        'locationId': locationId,
        'locale': locale,
      },
      options: await _authOptions(),
    );
    return GuardianSession.fromJson(response.data);
  }

  /// 예약 생성 + 맞춤 일정
  Future<Booking> createBooking(BookingRequest request) async {
    final response = await _dio.post(
      '/cheongrium/booking',
      data: request.toJson(),
      options: await _authOptions(),
    );
    return Booking.fromJson(response.data);
  }

  /// 데스티니 향 추천
  Future<DestinyScent> getDestinyScent(String sajuProfileId) async {
    final response = await _dio.post(
      '/cheongrium/destiny-scent',
      data: {'sajuProfileId': sajuProfileId},
      options: await _authOptions(),
    );
    return DestinyScent.fromJson(response.data);
  }
}
```

## 4.3 Voice WebSocket Client (voice-sidecar 연결 - 코드 재활용)

```dart
// lib/data/sources/voice_ws_client.dart

class VoiceWebSocketClient {
  WebSocketChannel? _channel;
  final StreamController<VoiceEvent> _eventController = StreamController.broadcast();

  Stream<VoiceEvent> get events => _eventController.stream;

  /// 음성 세션 연결 (voice-sidecar WebSocket)
  Future<void> connect(String wsUrl) async {
    _channel = WebSocketChannel.connect(Uri.parse(wsUrl));

    _channel!.stream.listen(
      (message) => _handleMessage(message),
      onError: (error) => _eventController.add(VoiceEvent.error(error.toString())),
      onDone: () => _eventController.add(VoiceEvent.disconnected()),
    );
  }

  void _handleMessage(dynamic message) {
    final data = jsonDecode(message);

    switch (data['type']) {
      case 'ready':
        _eventController.add(VoiceEvent.ready(data['sessionId']));
        break;
      case 'listening':
        _eventController.add(VoiceEvent.listening());
        break;
      case 'processing':
        _eventController.add(VoiceEvent.processing());
        break;
      case 'transcript':
        _eventController.add(VoiceEvent.transcript(data['text']));
        break;
      case 'response':
        _eventController.add(VoiceEvent.response(data['text']));
        break;
      case 'tts_chunk':
        // PCM audio chunk (base64 encoded)
        final audioBytes = base64Decode(data['data']);
        _eventController.add(VoiceEvent.audioChunk(audioBytes));
        break;
      case 'tts_done':
        _eventController.add(VoiceEvent.audioDone());
        break;
      case 'speaking':
        _eventController.add(VoiceEvent.speaking());
        break;
    }
  }

  /// 오디오 청크 전송 (마이크 입력)
  void sendAudio(Uint8List audioData) {
    _channel?.sink.add(jsonEncode({
      'type': 'audio',
      'data': base64Encode(audioData),
    }));
  }

  /// 대화 인터럽트
  void interrupt() {
    _channel?.sink.add(jsonEncode({'type': 'interrupt'}));
  }

  /// 세션 종료
  void endSession() {
    _channel?.sink.add(jsonEncode({'type': 'end'}));
    _channel?.sink.close();
  }

  void dispose() {
    _channel?.sink.close();
    _eventController.close();
  }
}

/// Voice events from WebSocket
sealed class VoiceEvent {
  factory VoiceEvent.ready(String sessionId) = VoiceEventReady;
  factory VoiceEvent.listening() = VoiceEventListening;
  factory VoiceEvent.processing() = VoiceEventProcessing;
  factory VoiceEvent.transcript(String text) = VoiceEventTranscript;
  factory VoiceEvent.response(String text) = VoiceEventResponse;
  factory VoiceEvent.audioChunk(Uint8List data) = VoiceEventAudioChunk;
  factory VoiceEvent.audioDone() = VoiceEventAudioDone;
  factory VoiceEvent.speaking() = VoiceEventSpeaking;
  factory VoiceEvent.error(String message) = VoiceEventError;
  factory VoiceEvent.disconnected() = VoiceEventDisconnected;
}
```

---

# 5. Guardian System Prompts

## 5.1 lib/cheongrium/guardian-prompts.ts (신규)

```typescript
// lib/cheongrium/guardian-prompts.ts

export const GUARDIAN_PERSONAS = {
  hwangryong: {
    name: '황룡',
    hanja: '黃龍',
    element: 'earth',
    voiceId: 'CARTESIA_VOICE_ID', // voice-sidecar Cartesia 음성 재활용
    systemPrompt: `당신은 황룡(黃龍), 대지의 수호신입니다.
청리움 보리산 약초원의 정령으로, 따뜻하고 안정적인 에너지를 가졌습니다.

## 역할
- 사상체질과 약초에 대한 깊은 지식 보유
- 방문객의 사주에 맞는 약초 추천
- 건강과 조화에 대한 조언

## 말투
- 따뜻하고 부드러움
- 현자처럼 차분함
- 한의학 용어를 쉽게 풀어 설명

## 예시 응답
"음, 당신의 사주를 보니 수(水) 기운이 부족하군요.
이 약초원의 오미자차를 드셔보세요.
신맛이 간을 도와 목(木) 기운을 살리고,
그것이 다시 화(火)를 생하여 균형을 찾을 거예요."`,
    locations: ['yakchowon', 'herb_garden'],
  },

  baekho: {
    name: '백호',
    hanja: '白虎',
    element: 'metal',
    voiceId: 'CARTESIA_VOICE_ID',
    systemPrompt: `당신은 백호(白虎), 금속의 수호신입니다.
청리움 오하산방의 정령으로, 예리하고 정제된 에너지를 가졌습니다.

## 역할
- 다례(茶禮)와 전통 의례 전문
- 마음을 비우고 정제하는 수련 안내
- 결단력과 명확함에 대한 조언

## 말투
- 위엄 있지만 따뜻함
- 정확하고 간결함
- 무예 수련자의 기품

## 예시 응답
"차를 우려내는 것은 마음을 다스리는 것과 같습니다.
당신의 사주에 금(金) 기운이 과하니,
물의 온도를 조금 낮추어 유연함을 담아보세요.
그것이 당신 내면의 날카로움을 부드럽게 녹일 것입니다."`,
    locations: ['ohahsanbang', 'tea_house'],
  },

  hyeonmu: {
    name: '현무',
    hanja: '玄武',
    element: 'water',
    voiceId: 'CARTESIA_VOICE_ID',
    systemPrompt: `당신은 현무(玄武), 물의 수호신입니다.
청리움 명당 기도터의 정령으로, 깊고 신비로운 에너지를 가졌습니다.

## 역할
- 풍수지리와 기(氣)의 흐름 전문
- 명상과 영적 수련 안내
- 직관과 지혜에 대한 조언

## 말투
- 느리고 깊은 어조
- 명상적이고 신비로움
- 때로는 수수께끼 같은 표현

## 예시 응답
"이 자리는 용(龍)의 기운이 모이는 혈(穴)입니다.
당신의 사주에서 수(水)의 흐름이 막혀 있군요.
눈을 감고 발밑의 땅을 느껴보세요.
물은 막히면 돌아갈 길을 찾습니다. 당신도 그러할 것입니다."`,
    locations: ['myeongdang_1', 'myeongdang_2', 'meditation_spot'],
  },

  cheongryong: {
    name: '청룡',
    hanja: '靑龍',
    element: 'wood',
    voiceId: 'CARTESIA_VOICE_ID',
    systemPrompt: `당신은 청룡(靑龍), 나무의 수호신입니다.
청리움 녹차밭과 포도밭의 정령으로, 생동감 있고 성장하는 에너지를 가졌습니다.

## 역할
- 식물과 농업, 계절의 순환 전문
- 성장과 새로운 시작에 대한 조언
- 자연의 리듬과 조화

## 말투
- 활기차고 희망적
- 자연의 은유를 자주 사용
- 젊은 현자의 에너지

## 예시 응답
"보세요, 이 녹차나무들을. 봄이 되면 새순이 돋아나고,
여름에 무성해지고, 가을에 열매 맺고, 겨울에 쉬어갑니다.
당신의 사주에 목(木)이 부족하다고요?
걱정 마세요. 지금은 뿌리를 내리는 시간입니다.
때가 되면 당신도 힘차게 솟아오를 거예요."`,
    locations: ['nokcha_field', 'podo_field', 'forest_trail'],
  },

  jujak: {
    name: '주작',
    hanja: '朱雀',
    element: 'fire',
    voiceId: 'CARTESIA_VOICE_ID',
    systemPrompt: `당신은 주작(朱雀), 불의 수호신입니다.
청리움 용소 연못의 정령으로, 열정적이고 변화하는 에너지를 가졌습니다.

## 역할
- 감정과 창의성 전문
- 변화와 재탄생에 대한 조언
- 열정과 사랑에 대한 통찰

## 말투
- 따뜻하고 열정적
- 영감을 주는 어조
- 시적인 표현

## 예시 응답
"용소의 물에 비친 당신의 모습이 보이나요?
주작은 불꽃 속에서 다시 태어납니다.
당신의 사주에 화(火)가 과하다고요?
그 열정은 억누르는 것이 아니라 승화시키는 것입니다.
이 연못의 물처럼, 타오르되 고요함을 잃지 마세요."`,
    locations: ['yongso', 'sunset_pavilion'],
  },
} as const;

export type GuardianId = keyof typeof GUARDIAN_PERSONAS;

/**
 * Build guardian system prompt with user's saju context
 */
export function buildGuardianSystemPrompt(
  guardianId: GuardianId,
  sajuContext?: {
    dayMaster: string;
    elementScores: Record<string, number>;
    dominantElements: string[];
    lackingElements: string[];
    bodyStrength: string;
  },
  locationId?: string,
  locale: string = 'ko'
): string {
  const guardian = GUARDIAN_PERSONAS[guardianId];
  let prompt = guardian.systemPrompt;

  // Add location context
  if (locationId) {
    prompt += `\n\n현재 위치: ${locationId}`;
  }

  // Add saju context
  if (sajuContext) {
    prompt += `\n
## 방문객 사주 정보
- 일간: ${sajuContext.dayMaster}
- 신강/신약: ${sajuContext.bodyStrength}
- 강한 오행: ${sajuContext.dominantElements.join(', ')}
- 부족한 오행: ${sajuContext.lackingElements.join(', ')}
- 오행 점수: 목 ${sajuContext.elementScores.wood}, 화 ${sajuContext.elementScores.fire}, 토 ${sajuContext.elementScores.earth}, 금 ${sajuContext.elementScores.metal}, 수 ${sajuContext.elementScores.water}

이 정보를 바탕으로 방문객에게 맞춤형 조언을 제공하세요.
${guardian.element} 오행과 연관된 조언을 우선하되, 방문객의 부족한 오행을 보완하는 방향으로 안내하세요.`;
  }

  // Language instruction
  if (locale === 'en') {
    prompt += '\n\n[Respond in English while maintaining the mystical Korean traditional atmosphere]';
  }

  return prompt;
}
```

---

# 6. Location & Geofencing Data

## 6.1 lib/cheongrium/locations.ts (신규)

```typescript
// lib/cheongrium/locations.ts

export const CHEONGRIUM_LOCATIONS: LocationPOI[] = [
  {
    id: 'yakchowon',
    name: '약초원',
    nameHanja: '藥草園',
    latitude: 37.XXXXX,  // 실제 좌표 입력
    longitude: 127.XXXXX,
    geofenceRadius: 50,
    guardianId: 'hwangryong',
    audioIntroUrl: 'https://cdn.cheongrium.kr/audio/cheongrium/yakchowon_intro.mp3',
    audioScriptUrl: 'https://cdn.cheongrium.kr/audio/cheongrium/yakchowon_script.json',
    description: '청리움의 약초원입니다. 황룡 수호신이 함께합니다.',
    elementConnection: '황룡(黃龍)은 대지(土)의 수호신으로, 약초원의 생명력을 지킵니다.',
  },
  {
    id: 'ohahsanbang',
    name: '오하산방',
    nameHanja: '悟霞山房',
    latitude: 37.XXXXX,
    longitude: 127.XXXXX,
    geofenceRadius: 30,
    guardianId: 'baekho',
    audioIntroUrl: 'https://cdn.cheongrium.kr/audio/cheongrium/ohahsanbang_intro.mp3',
    audioScriptUrl: 'https://cdn.cheongrium.kr/audio/cheongrium/ohahsanbang_script.json',
    description: '전통 다례를 체험하는 공간입니다. 백호 수호신이 함께합니다.',
    elementConnection: '백호(白虎)는 금(金)의 수호신으로, 정제된 마음가짐을 일깨웁니다.',
  },
  {
    id: 'myeongdang_1',
    name: '명당 기도터',
    nameHanja: '明堂祈禱處',
    latitude: 37.XXXXX,
    longitude: 127.XXXXX,
    geofenceRadius: 20,
    guardianId: 'hyeonmu',
    audioIntroUrl: 'https://cdn.cheongrium.kr/audio/cheongrium/myeongdang_intro.mp3',
    audioScriptUrl: 'https://cdn.cheongrium.kr/audio/cheongrium/myeongdang_script.json',
    description: '기도와 명상의 명당입니다. 현무 수호신이 함께합니다.',
    elementConnection: '현무(玄武)는 수(水)의 수호신으로, 깊은 직관과 지혜를 일깨웁니다.',
  },
  {
    id: 'nokcha_field',
    name: '녹차밭',
    nameHanja: '綠茶園',
    latitude: 37.XXXXX,
    longitude: 127.XXXXX,
    geofenceRadius: 60,
    guardianId: 'cheongryong',
    audioIntroUrl: 'https://cdn.cheongrium.kr/audio/cheongrium/nokcha_intro.mp3',
    audioScriptUrl: 'https://cdn.cheongrium.kr/audio/cheongrium/nokcha_script.json',
    description: '설록차 녹차밭입니다. 청룡 수호신이 함께합니다.',
    elementConnection: '청룡(靑龍)은 목(木)의 수호신으로, 성장과 생명의 에너지를 불어넣습니다.',
  },
  {
    id: 'yongso',
    name: '용소',
    nameHanja: '龍沼',
    latitude: 37.XXXXX,
    longitude: 127.XXXXX,
    geofenceRadius: 40,
    guardianId: 'jujak',
    audioIntroUrl: 'https://cdn.cheongrium.kr/audio/cheongrium/yongso_intro.mp3',
    audioScriptUrl: 'https://cdn.cheongrium.kr/audio/cheongrium/yongso_script.json',
    description: '용이 살았다는 연못입니다. 주작 수호신이 함께합니다.',
    elementConnection: '주작(朱雀)은 화(火)의 수호신으로, 열정과 변화의 에너지를 깨웁니다.',
  },
];

export interface LocationPOI {
  id: string;
  name: string;
  nameHanja: string;
  latitude: number;
  longitude: number;
  geofenceRadius: number;
  guardianId: string;
  audioIntroUrl: string;
  audioScriptUrl: string;
  description: string;
  elementConnection: string;
}
```

---

# 7. Database Migrations (Supabase MCP)

```sql
-- 청리움 현장 체험 테이블 (기존 saju_analyses 연동)

-- 예약 테이블
CREATE TABLE cr_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  saju_analysis_id UUID REFERENCES saju_analyses(id),

  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('day_course', 'overnight', 'vip')),

  -- AI 생성 맞춤 일정
  itinerary JSONB,
  primary_guardian TEXT NOT NULL,

  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 위치 방문 로그
CREATE TABLE cr_location_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  booking_id UUID REFERENCES cr_bookings(id),
  location_id TEXT NOT NULL,
  guardian_id TEXT NOT NULL,

  entered_at TIMESTAMPTZ NOT NULL,
  exited_at TIMESTAMPTZ,
  dwell_seconds INTEGER,

  -- 상호작용 데이터
  voice_interactions INTEGER DEFAULT 0,
  questions_asked JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수호신 대화 로그 (기존 conversations 테이블 확장)
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS guardian_id TEXT,
ADD COLUMN IF NOT EXISTS location_id TEXT,
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES cr_bookings(id);

-- 데스티니 향 주문
CREATE TABLE cr_scent_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  booking_id UUID REFERENCES cr_bookings(id),
  saju_analysis_id UUID REFERENCES saju_analyses(id),

  formula JSONB NOT NULL,
  scent_name TEXT,

  status TEXT DEFAULT 'pending',
  shipping_address JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE cr_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cr_location_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cr_scent_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON cr_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON cr_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own visits" ON cr_location_visits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visits" ON cr_location_visits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own scent orders" ON cr_scent_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scent orders" ON cr_scent_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

# 8. Development Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT ROADMAP (코드 재활용 중심)                     │
└─────────────────────────────────────────────────────────────────────────────┘

PHASE 1: 백엔드 확장 (기존 코드 재활용) (2-3 weeks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Add /api/cheongrium/* routes (기존 lib/saju/* 재활용)
• Add guardian-prompts.ts with 5 Guardian personas
• Add Supabase tables (cr_bookings, cr_location_visits, cr_scent_orders)
• Update voice-sidecar to support guardian context switching
• Test API endpoints

Deliverable: cheongrium.vercel.app API ready


PHASE 2: Flutter App Foundation (3-4 weeks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Project setup with Riverpod, Supabase Flutter
• Supabase auth (기존 프로젝트 공유)
• CheongriuumApiClient connecting to cheongrium.vercel.app/api
• Basic UI: Home, Saju results viewer, Profile

Deliverable: Flutter app with auth + saju result viewing


PHASE 3: Location & Audio (Flutter only) (3-4 weeks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• GPS geofencing with flutter_background_geolocation
• Pre-recorded guardian audio playback (CDN)
• Offline content caching (Hive)
• Map UI with location markers

Deliverable: Location-triggered pre-recorded audio


PHASE 4: Voice AI Integration (기존 voice-sidecar 재활용) (2-3 weeks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• VoiceWebSocketClient → 기존 voice-sidecar (Fly.io)
• Real-time voice conversation with guardians
• Audio recording + streaming (record package)
• Conversation history sync (기존 Supabase conversations 테이블)

Deliverable: Live voice conversation with guardians


PHASE 5: Full Experience (2-3 weeks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Booking integration
• Destiny Scent ordering
• Keepsakes (Destiny Map, certificates)
• Push notifications

Deliverable: Complete guest journey


PHASE 6: Polish & Launch (2 weeks)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Beta testing at Cheongrium
• Performance optimization
• App Store / Google Play submission

Deliverable: Public launch


Total: ~14-18 weeks (3.5-4.5 months)
```

---

# 9. Key Integration Points Summary

| Feature | saju-hancom 코드 재활용 | Flutter App | Backend Route |
|---------|------------------------|-------------|---------------|
| **Auth** | Supabase Auth | Supabase Flutter | Same project |
| **Saju Analysis** | `lib/saju/*` 전체 | View results | /api/saju/* |
| **Voice Chat** | `voice-sidecar/*` 전체 | WebSocket UI | voice-sidecar |
| **Guardian Personas** | - | Location-triggered | /api/cheongrium/guardian-session |
| **GPS Geofencing** | - | flutter_background_geolocation | Location data API |
| **Offline Audio** | - | just_audio + Hive | CDN pre-recorded |
| **Booking** | - | Core feature | /api/cheongrium/booking |
| **Destiny Scent** | - | Order UI | /api/cheongrium/destiny-scent |

---

# 10. Cost Considerations

| Service | Usage | Estimated Cost |
|---------|-------|----------------|
| **Gemini API** | Saju pipeline + Guardian LLM (재활용) | ~$50-100/month |
| **Cartesia TTS** | Voice responses (재활용) | ~$30-50/month |
| **Groq STT** | Voice input (재활용) | ~$10-20/month |
| **Supabase** | Pro plan (기존 프로젝트 공유) | $25/month |
| **Fly.io** | voice-sidecar (기존 배포 공유) | ~$10-20/month |
| **Vercel** | Next.js hosting (cheongrium.vercel.app) | Pro plan |
| **CDN** | Audio/images | ~$10/month |
| **Total** | | ~$135-225/month |

---

# 11. Files to Create/Modify

## New Files
```
lib/cheongrium/
├── locations.ts              # Location POI data
├── guardian-prompts.ts       # Guardian personas & prompts
└── types.ts                  # Cheongrium-specific types

app/api/cheongrium/
├── locations/route.ts        # GET location POIs
├── guardian-session/route.ts # POST create guardian voice session
├── booking/route.ts          # POST create booking + itinerary
└── destiny-scent/route.ts    # POST get scent recommendation
```

## Modified Files (기존 saju-hancom 코드)
```
lib/voice/voice-prompts.ts     # Add guardian context type
voice-sidecar/src/constants.ts # Add guardian voice settings
```

---

## Code Reuse Summary

이 아키텍처는 **saju-hancom 코드베이스를 최대한 재활용**합니다:

| 재활용 코드 | 설명 |
|------------|------|
| `lib/saju/*` | 사주 계산, 파이프라인, 오행, 십성, 신살 전체 |
| `voice-sidecar/*` | Cartesia TTS, Groq STT, WebSocket 핸들러 |
| `app/api/saju/*` | 사주 분석 API 엔드포인트 |
| `app/api/voice/*` | 음성 세션 API |
| `lib/supabase/*` | Supabase 클라이언트 유틸리티 |

Flutter 앱은 동일한 백엔드 API를 호출하는 **thin client** 역할만 하므로 유지보수 오버헤드가 최소화됩니다.

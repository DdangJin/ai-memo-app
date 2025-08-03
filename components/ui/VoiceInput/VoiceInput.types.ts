import { SupportedLanguage } from '@/hooks/useSpeechRecognition';

// 음성 입력 상태 타입 정의
export type VoiceInputStatus = 'idle' | 'listening' | 'processing' | 'error';

export type VoicePermissionStatus =
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'checking';

// 음성 입력 이벤트 타입
export interface VoiceInputEvents {
  onTranscriptChange?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  onStatusChange?: (status: VoiceInputStatus) => void;
  onError?: (error: string) => void;
  onPermissionChange?: (status: VoicePermissionStatus) => void;
}

// 음성 입력 설정 타입
export interface VoiceInputConfig {
  language?: SupportedLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  grammars?: SpeechGrammarList;
}

// 음성 인식 결과 타입
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: {
    transcript: string;
    confidence: number;
  }[];
}

// 음성 입력 컨텍스트 타입
export interface VoiceInputContextValue {
  status: VoiceInputStatus;
  permissionStatus: VoicePermissionStatus;
  isSupported: boolean;
  isMicrophoneAvailable: boolean;
  supportsContinuous: boolean;
  config: VoiceInputConfig;
  setConfig: (config: Partial<VoiceInputConfig>) => void;
}

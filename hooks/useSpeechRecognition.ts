'use client';

import { useEffect, useState, useCallback } from 'react';
import SpeechRecognition, {
  useSpeechRecognition as useReactSpeechRecognition,
} from 'react-speech-recognition';

// Context7 베스트 프랙티스: 브라우저 호환성 및 권한 관리
export interface SpeechRecognitionHookReturn {
  // 상태
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  isListening: boolean;
  isAvailable: boolean;
  isMicrophoneAvailable: boolean;
  supportsContinuousListening: boolean;

  // 컨트롤 메서드
  startListening: (options?: {
    continuous?: boolean;
    language?: string;
  }) => Promise<void>;
  stopListening: () => Promise<void>;
  abortListening: () => Promise<void>;
  resetTranscript: () => void;

  // 에러 상태
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'checking';
}

// Context7 베스트 프랙티스: 지원되는 언어 코드 타입
export type SupportedLanguage =
  | 'ko-KR' // 한국어
  | 'en-US' // 영어 (미국)
  | 'en-GB' // 영어 (영국)
  | 'ja-JP' // 일본어
  | 'zh-CN' // 중국어 (간체)
  | 'zh-TW'; // 중국어 (번체)

export const useSpeechRecognition = (): SpeechRecognitionHookReturn => {
  // React Speech Recognition 훅 사용
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    browserSupportsContinuousListening,
    isMicrophoneAvailable,
  } = useReactSpeechRecognition({
    clearTranscriptOnListen: true,
  });

  // Context7 베스트 프랙티스: Hydration 에러 방지를 위한 클라이언트 마운트 상태
  const [isMounted, setIsMounted] = useState(false);

  // 로컬 상태
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'prompt' | 'granted' | 'denied' | 'checking'
  >('prompt');

  // Context7 베스트 프랙티스: 음성 인식 시작 (간소화)
  const startListening = useCallback(
    async (options: { continuous?: boolean; language?: string } = {}) => {
      // 1. 기본 지원 확인
      if (!browserSupportsSpeechRecognition) {
        setError(
          '이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해주세요.'
        );
        return;
      }

      try {
        setError(null);
        console.log(
          'Context7: Starting SpeechRecognition with options:',
          options
        );

        await SpeechRecognition.startListening({
          continuous: options.continuous ?? false,
          language: options.language ?? 'ko-KR',
        });

        console.log('Context7: SpeechRecognition started successfully');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setError('음성 인식을 시작할 수 없습니다. 다시 시도해주세요.');
      }
    },
    [browserSupportsSpeechRecognition]
  );

  // Context7 베스트 프랙티스: 음성 인식 중지
  const stopListening = useCallback(async () => {
    try {
      setError(null);
      await SpeechRecognition.stopListening();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
      setError('음성 인식을 중지할 수 없습니다.');
    }
  }, []);

  // Context7 베스트 프랙티스: 음성 인식 중단
  const abortListening = useCallback(async () => {
    try {
      setError(null);
      await SpeechRecognition.abortListening();
    } catch (error) {
      console.error('Failed to abort speech recognition:', error);
      setError('음성 인식을 중단할 수 없습니다.');
    }
  }, []);

  // Context7 베스트 프랙티스: 클라이언트 마운트 상태 설정 (Hydration 에러 방지)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Context7 베스트 프랙티스: 클라이언트 마운트 후 브라우저 호환성 확인
  useEffect(() => {
    if (!isMounted) return;

    console.log('Context7: Initializing speech recognition...');
    console.log(
      'Context7: Browser supports speech recognition:',
      browserSupportsSpeechRecognition
    );

    if (typeof navigator !== 'undefined') {
      console.log('Context7: User agent:', navigator.userAgent);
    }

    // 1. 먼저 브라우저 지원 확인 (인라인)
    const hasWebSpeechAPI =
      typeof window !== 'undefined' &&
      ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

    if (!hasWebSpeechAPI) {
      setError(
        '이 브라우저는 Web Speech API를 지원하지 않습니다. Chrome, Edge, 또는 Safari를 사용해주세요.'
      );
      return;
    }

    // Firefox 확인
    if (typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      const isFirefox = userAgent.includes('firefox');

      if (isFirefox) {
        setError(
          'Firefox는 Web Speech API를 지원하지 않습니다. Chrome 또는 Edge를 사용해주세요.'
        );
        return;
      }
    }

    console.log('Context7: Web Speech API support check passed');

    // 2. 지원되는 경우에만 권한 확인 (인라인)
    if (browserSupportsSpeechRecognition) {
      console.log('Context7: Checking microphone permission...');

      // 권한 확인 로직 (인라인)
      if (!navigator.permissions) {
        console.log(
          'Context7: Permissions API not supported, setting prompt state'
        );
        setPermissionStatus('prompt');
        setError(null);
        return;
      }

      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then(permission => {
          const currentState = permission.state as
            | 'prompt'
            | 'granted'
            | 'denied';
          console.log('Context7: Permission state:', currentState);
          setPermissionStatus(currentState);

          if (currentState === 'granted') {
            setError(null);
          } else if (currentState === 'denied') {
            setError(
              '마이크 권한이 거부되었습니다. 브라우저 주소창의 🔒 아이콘을 클릭하여 권한을 허용해주세요.'
            );
          }

          // 권한 상태 변경 감지
          permission.addEventListener('change', () => {
            const newState = permission.state as
              | 'prompt'
              | 'granted'
              | 'denied';
            console.log('Context7: Permission state changed to:', newState);
            setPermissionStatus(newState);
            if (newState === 'granted') {
              setError(null);
            }
          });
        })
        .catch(error => {
          console.error('Context7: Failed to check permission:', error);
          setPermissionStatus('prompt');
          setError(null);
        });
    }
  }, [isMounted, browserSupportsSpeechRecognition]);

  // Context7 베스트 프랙티스: Web Speech API 레퍼런스 저장
  useEffect(() => {
    if (browserSupportsSpeechRecognition && isMounted) {
      // SpeechRecognition 인스턴스는 라이브러리 내부에서 관리되므로 ref 저장 불필요
      console.log('Context7: SpeechRecognition initialized successfully');
    }
  }, [browserSupportsSpeechRecognition, isMounted]);

  // Context7 베스트 프랙티스: 페이지 포커스 시 권한 상태 재확인 (정책 위반 방지)
  useEffect(() => {
    if (!isMounted) return;

    const handleVisibilityChange = () => {
      if (!document.hidden && document.visibilityState === 'visible') {
        console.log(
          'Context7: Page became visible, rechecking permission status...'
        );
        // 간단한 권한 상태 재확인 (인라인)
        if (navigator.permissions) {
          navigator.permissions
            .query({ name: 'microphone' as PermissionName })
            .then(permission => {
              const currentState = permission.state as
                | 'prompt'
                | 'granted'
                | 'denied';
              setPermissionStatus(currentState);
            })
            .catch(() => {
              setPermissionStatus('prompt');
            });
        }
      }
    };

    const handleFocus = () => {
      console.log('Context7: Window focused, rechecking permission status...');
      // 간단한 권한 상태 재확인 (인라인)
      if (navigator.permissions) {
        navigator.permissions
          .query({ name: 'microphone' as PermissionName })
          .then(permission => {
            const currentState = permission.state as
              | 'prompt'
              | 'granted'
              | 'denied';
            setPermissionStatus(currentState);
          })
          .catch(() => {
            setPermissionStatus('prompt');
          });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isMounted]);

  return {
    // 상태
    transcript,
    interimTranscript,
    finalTranscript,
    isListening: listening,
    isAvailable: isMounted && browserSupportsSpeechRecognition,
    isMicrophoneAvailable:
      isMounted && (permissionStatus === 'granted' || isMicrophoneAvailable),
    supportsContinuousListening:
      isMounted && browserSupportsContinuousListening,

    // 컨트롤 메서드
    startListening,
    stopListening,
    abortListening,
    resetTranscript,

    // 에러 상태
    error,
    permissionStatus,
  };
};

'use client';

import React, { useState, useEffect } from 'react';
import {
  useSpeechRecognition,
  SupportedLanguage,
} from '@/hooks/useSpeechRecognition';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// 음성 입력 컴포넌트 props
export interface VoiceInputProps {
  onTranscriptChange?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  language?: SupportedLanguage;
  continuous?: boolean;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  autoStart?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptChange,
  onFinalTranscript,
  language = 'ko-KR',
  continuous = false,
  className,
  disabled = false,
  placeholder = '음성 입력을 시작하려면 마이크 버튼을 클릭하세요',
  autoStart = false,
}) => {
  const {
    transcript: globalTranscript,
    interimTranscript,
    finalTranscript: globalFinalTranscript,
    isListening,
    isAvailable,
    isMicrophoneAvailable,
    supportsContinuousListening,
    startListening,
    stopListening,
    abortListening,
    resetTranscript: resetGlobalTranscript,
    error,
    permissionStatus,
  } = useSpeechRecognition();

  // 각 VoiceInput 인스턴스별 독립 상태 관리
  const [localTranscript, setLocalTranscript] = useState('');
  const [localFinalTranscript, setLocalFinalTranscript] = useState('');
  const [isActiveInstance, setIsActiveInstance] = useState(false);
  const [hasUserInteraction, setHasUserInteraction] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  // hydration mismatch 방지
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드 렌더링 확보 + 시간 상태 관리
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setIsClient(true);
    // 시간은 클라이언트에서만 설정
    setCurrentTime(new Date().toLocaleTimeString('ko-KR'));

    // 1초마다 시간 업데이트
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('ko-KR'));
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  // 현재 활성 인스턴스에서만 transcript 처리 (Context7 MCP: 로컬 transcript 보호)
  useEffect(() => {
    // 음성 인식 중이고 활성 인스턴스일 때만 globalTranscript를 localTranscript에 반영
    // 음성 인식이 끝난 후에는 localTranscript를 보호하여 사용자가 결과를 확인할 수 있도록 함
    if (
      isActiveInstance &&
      isListening &&
      globalTranscript !== localTranscript &&
      globalTranscript.length > 0
    ) {
      setLocalTranscript(globalTranscript);
      if (onTranscriptChange) {
        onTranscriptChange(globalTranscript);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    globalTranscript,
    isListening,
    isActiveInstance,
    localTranscript,
    // onTranscriptChange는 의도적으로 제외: 외부 props로 자주 변경되어 무한 리렌더링 방지
  ]);

  useEffect(() => {
    // 활성 인스턴스에서 final transcript 처리 (isListening 조건 제거)
    if (isActiveInstance && globalFinalTranscript !== localFinalTranscript) {
      setLocalFinalTranscript(globalFinalTranscript);
      if (onFinalTranscript && globalFinalTranscript) {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'DEBUG DEBUG - onFinalTranscript 호출:',
            globalFinalTranscript
          );
        }
        onFinalTranscript(globalFinalTranscript);

        // final transcript 처리 완료 - current transcript는 다음 인식 시작까지 유지
        // (사용자가 결과를 확인할 수 있도록 바로 초기화하지 않음)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    globalFinalTranscript,
    isListening,
    isActiveInstance,
    localFinalTranscript,
    // onFinalTranscript, onTranscriptChange는 의도적으로 제외: 외부 props로 자주 변경될 수 있음
  ]);

  // final transcript 처리 완료 후 인스턴스 해제
  useEffect(() => {
    // final transcript가 처리되고 음성 인식이 중지된 후에만 인스턴스 해제
    if (
      !isListening &&
      isActiveInstance &&
      globalFinalTranscript &&
      localFinalTranscript === globalFinalTranscript
    ) {
      if (process.env.NODE_ENV === 'development') {
        console.log('DEBUG - 인스턴스 해제:', {
          isListening,
          globalFinalTranscript,
          localFinalTranscript,
        });
      }
      // 자동 종료 시 글로벌 transcript만 초기화 (current transcript는 유지)
      if (process.env.NODE_ENV === 'development') {
        console.log('DEBUG - 자동 종료 시 글로벌 transcript만 초기화');
      }
      resetGlobalTranscript(); // 글로벌 transcript만 초기화

      // final transcript 처리가 완료되었으므로 인스턴스 해제
      setTimeout(() => setIsActiveInstance(false), 100); // 약간의 지연으로 안전하게 처리
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isListening,
    isActiveInstance,
    globalFinalTranscript,
    localFinalTranscript,
    // onTranscriptChange, resetGlobalTranscript는 의도적으로 제외: 안정된 함수 및 무한 리렌더링 방지
  ]);

  // 자동 시작 (사용자 상호작용 후에만)
  useEffect(() => {
    if (
      autoStart &&
      hasUserInteraction &&
      isAvailable &&
      !isListening &&
      !disabled
    ) {
      startListening({ continuous, language });
    }
  }, [
    autoStart,
    hasUserInteraction,
    isAvailable,
    isListening,
    disabled,
    continuous,
    language,
    startListening,
  ]);

  // 권한 프롬프트 표시 타이밍
  useEffect(() => {
    if (isAvailable && permissionStatus === 'prompt' && !showPermissionPrompt) {
      // 즉시 권한 요청 안내 표시
      setShowPermissionPrompt(true);
    }
  }, [isAvailable, permissionStatus, showPermissionPrompt]);

  // 음성 인식 토글
  const handleToggleListening = async () => {
    setHasUserInteraction(true);

    if (isListening) {
      // 현재 이 인스턴스가 활성화되어 있을 때만 중지
      if (isActiveInstance) {
        if (continuous) {
          await stopListening();
        } else {
          await abortListening();
        }
        // final transcript 처리를 위해 인스턴스는 useEffect에서 해제
        if (process.env.NODE_ENV === 'development') {
          console.log('DEBUG - 음성 인식 중지, 인스턴스는 유지');
        }

        // 수동 중지 시 글로벌 transcript만 초기화 (current transcript는 다음 인식까지 유지)
        setTimeout(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('DEBUG - 수동 중지 시 글로벌 transcript만 초기화');
          }
          resetGlobalTranscript(); // 글로벌 transcript만 초기화
        }, 100);
      }
    } else {
      // 새로운 음성 인식 시작 - 이전 결과 초기화
      resetGlobalTranscript(); // 이전 transcript 초기화
      setIsActiveInstance(true);
      setLocalTranscript(''); // 새 인식 시작 시에만 current transcript 초기화
      setLocalFinalTranscript('');
      if (onTranscriptChange) {
        onTranscriptChange(''); // 새 인식 시작 시에만 UI 초기화
      }
      await startListening({ continuous, language });
    }
  };

  // 리셋 핸들러
  const handleReset = () => {
    resetGlobalTranscript();
    setLocalTranscript('');
    setLocalFinalTranscript('');
    setIsActiveInstance(false);
  };

  // 디버깅: 상태 변화시에만 디버그 로그 출력
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DEBUG - VoiceInput 상태 변화:', {
        isAvailable,
        permissionStatus,
        showPermissionPrompt,
        error,
        isListening,
        isActiveInstance,
      });
    }
  }, [
    isAvailable,
    permissionStatus,
    showPermissionPrompt,
    error,
    isListening,
    isActiveInstance,
  ]);

  // 모든 조건부 렌더링을 우회하고 메인 UI 강제 표시
  // if (isAvailable === false) { ... } - 주석 처리
  // if (isAvailable && permissionStatus === 'prompt' && showPermissionPrompt) { - 주석 처리

  // 메인 UI 강제 표시 (디버깅용)
  if (false) {
    // 조건을 false로 설정하여 권한 프롬프트 우회
    return (
      <div
        className={cn(
          'max-w-md mx-auto p-8 bg-white border-2 border-blue-200 rounded-2xl shadow-xl',
          className
        )}
      >
        <div className="text-center space-y-6">
          {/* 아이콘과 헤더 */}
          <div className="flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎤</span>
            </div>
          </div>

          {/* 메인 질문 - Google Meet 스타일 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              음성으로 소통하시겠습니까?
            </h2>
            <p className="text-gray-600 leading-relaxed">
              음성 인식 기능을 사용하려면 마이크 접근이 필요합니다.
              <br />
              언제든지 마이크를 끄거나 켤 수 있습니다.
            </p>
          </div>

          {/* 사용자 의도 확인 버튼들 */}
          <div className="space-y-3">
            <Button
              onClick={async () => {
                console.log(
                  'DEBUG: User wants to use voice - requesting permission'
                );
                try {
                  if (
                    typeof navigator !== 'undefined' &&
                    navigator.mediaDevices
                  ) {
                    const stream = await navigator.mediaDevices.getUserMedia({
                      audio: true,
                    });
                    stream.getTracks().forEach(track => track.stop());
                    console.log('DEBUG: Voice permission granted successfully');
                    setShowPermissionPrompt(false);
                    // 부드러운 상태 전환을 위한 짧은 지연
                    setTimeout(() => window.location.reload(), 500);
                  }
                } catch (error) {
                  console.error('DEBUG: Voice permission denied:', error);
                  alert(
                    '권한이 거부되었습니다. 브라우저 주소창의 🔒 아이콘을 클릭하여 마이크 권한을 허용해주세요.'
                  );
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              aria-label="마이크 및 음성 인식 허용"
            >
              🎤 예, 음성 인식을 사용하겠습니다
            </Button>

            <Button
              onClick={() => {
                console.log(
                  'DEBUG: User does not want to use voice - proceeding without'
                );
                setShowPermissionPrompt(false);
                setNotification(
                  '음성 인식 없이 계속 진행합니다. 나중에 필요하면 권한을 허용할 수 있습니다.'
                );
                // 알림은 5초 후 자동 제거
                setTimeout(() => setNotification(null), 5000);
              }}
              variant="outline"
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-4 px-6 rounded-xl transition-all duration-200"
              aria-label="음성 인식 없이 계속"
            >
              나중에 하겠습니다
            </Button>
          </div>

          {/* 안내 메시지 */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-1">
              <span>🔒</span>
              <span>
                안전: 권한은 언제든지 변경할 수 있으며, 브라우저에서 관리됩니다
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  } // 권한 프롬프트 섹션 종료 (디버깅용으로 비활성화됨)

  return (
    <div className={cn('max-w-2xl mx-auto space-y-6', className)}>
      {/* 2024 최신 음성 인식 UI */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        {/* 헤더 섹션 */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  AI 음성 인식
                </h3>
                <p className="text-blue-100 text-sm">
                  실시간 한국어 음성 텍스트 변환
                </p>
              </div>
            </div>

            {/* 실시간 상태 표시 */}
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-300',
                  permissionStatus === 'granted'
                    ? 'bg-green-400 shadow-lg shadow-green-400/50'
                    : permissionStatus === 'denied'
                      ? 'bg-red-400 shadow-lg shadow-red-400/50'
                      : 'bg-yellow-400 shadow-lg shadow-yellow-400/50',
                  isListening && 'animate-pulse scale-110'
                )}
              ></div>
              <span className="text-white text-sm font-medium">
                {isListening
                  ? '듣는 중'
                  : permissionStatus === 'granted'
                    ? '준비완료'
                    : permissionStatus === 'denied'
                      ? '권한거부'
                      : '설정필요'}
              </span>
            </div>
          </div>
        </div>

        {/* 컨트롤 패널 */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-center space-x-4">
            {/* 메인 음성 인식 버튼 */}
            <Button
              onClick={handleToggleListening}
              disabled={
                disabled ||
                permissionStatus === 'checking' ||
                !isMicrophoneAvailable
              }
              className={cn(
                'relative w-16 h-16 rounded-full text-white font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105',
                isListening && isActiveInstance
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : isListening && !isActiveInstance
                    ? 'bg-orange-500 hover:bg-orange-600 opacity-60'
                    : 'bg-blue-600 hover:bg-blue-700'
              )}
              aria-label={
                isListening && isActiveInstance
                  ? '음성 인식 중지'
                  : isListening && !isActiveInstance
                    ? '다른 패널 사용 중'
                    : '음성 인식 시작'
              }
            >
              {isListening && isActiveInstance ? (
                <div className="flex flex-col items-center">
                  <span className="text-2xl">⏹</span>
                  <span className="text-xs">중지</span>
                </div>
              ) : isListening && !isActiveInstance ? (
                <div className="flex flex-col items-center">
                  <span className="text-2xl">⏸️</span>
                  <span className="text-xs">대기</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-2xl">🎤</span>
                  <span className="text-xs">시작</span>
                </div>
              )}
            </Button>

            {/* 권한 상태별 스마트 버튼 */}
            {permissionStatus !== 'granted' && (
              <Button
                onClick={async () => {
                  // 2024 표준 - 안전한 클릭 이벤트 처리

                  console.log(
                    'DEBUG: 2024 Standard - User gesture detected for permission request'
                  );

                  try {
                    if (
                      typeof navigator !== 'undefined' &&
                      navigator.mediaDevices &&
                      navigator.mediaDevices.getUserMedia
                    ) {
                      console.log(
                        'DEBUG: Starting getUserMedia with explicit user gesture...'
                      );

                      // 즉시 사용자 제스처 컨텍스트에서 실행
                      const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: false, // 마이크만 요청
                      });

                      // 즉시 스트림 정리 (권한 확인 목적)
                      stream.getTracks().forEach(track => {
                        track.stop();
                        console.log('DEBUG: Track stopped:', track.kind);
                      });

                      console.log(
                        'DEBUG: Permission granted successfully via user gesture'
                      );

                      // 성공 피드백
                      setTimeout(() => {
                        alert(
                          '✅ 마이크 권한이 성공적으로 허용되었습니다!\n\n이제 음성 인식 기능을 자유롭게 사용할 수 있습니다.'
                        );
                        window.location.reload();
                      }, 100);
                    } else {
                      throw new Error('getUserMedia API가 지원되지 않습니다.');
                    }
                  } catch (error) {
                    console.error('DEBUG: Permission request failed:', error);

                    if (error instanceof DOMException) {
                      if (error.name === 'NotAllowedError') {
                        setTimeout(() => {
                          alert(`❌ 마이크 권한이 거부되었습니다.

🔧 해결 방법:
1. 브라우저 주소창 왼쪽의 🔒 또는 🛡️ 아이콘 클릭
2. "마이크" 설정을 "허용"으로 변경
3. 페이지 새로고침 (F5)

💡 팁: Chrome의 경우 주소창에 직접 마이크 아이콘이 나타날 수 있습니다.`);
                        }, 100);
                      } else if (error.name === 'NotSupportedError') {
                        alert(
                          '❌ 이 브라우저는 마이크 기능을 지원하지 않습니다.\n\nChrome, Edge, 또는 Safari를 사용해주세요.'
                        );
                      } else {
                        alert(
                          `❌ 마이크 접근 오류: ${error.message}\n\n다시 시도해주세요.`
                        );
                      }
                    } else {
                      alert(
                        `❌ 예상치 못한 오류가 발생했습니다: ${(error as Error).message}`
                      );
                    }

                    setShowPermissionPrompt(true);
                  }
                }}
                className={cn(
                  'px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 select-none',
                  permissionStatus === 'denied'
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                )}
                aria-label={
                  permissionStatus === 'denied'
                    ? '마이크 권한 재요청'
                    : '마이크 권한 허용'
                }
              >
                {permissionStatus === 'denied' ? (
                  <>🚨 권한 재요청 (클릭)</>
                ) : (
                  <>🎤 마이크 권한 허용하기</>
                )}
              </Button>
            )}

            {/* 초기화 버튼 */}
            <Button
              onClick={handleReset}
              disabled={disabled || (!localTranscript && !localFinalTranscript)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              aria-label="음성 입력 초기화"
            >
              🔄 초기화
            </Button>
          </div>

          {/* 부가 기능 */}
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span>🔊</span>
                <span>실시간 변환</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🌐</span>
                <span>한국어 지원</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⚡</span>
                <span>AI 기반</span>
              </div>
            </div>
          </div>
        </div>

        {/* 현대적 트랜스크립트 영역 */}
        <div className="p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-gray-900 font-semibold">음성 인식 결과</h4>
            {(localTranscript ||
              (isActiveInstance ? interimTranscript : '')) && (
              <div className="text-sm text-gray-500">
                길이:{' '}
                {
                  (
                    localTranscript +
                    (isActiveInstance ? interimTranscript : '')
                  ).length
                }
                자
              </div>
            )}
          </div>

          <div className="min-h-[120px] p-4 bg-gray-50 border border-gray-200 rounded-xl">
            {localTranscript || (isActiveInstance ? interimTranscript : '') ? (
              <div className="space-y-2">
                {localFinalTranscript && (
                  <div className="text-gray-900 leading-relaxed">
                    {localFinalTranscript}
                  </div>
                )}
                {localTranscript && (
                  <div className="text-gray-700 leading-relaxed">
                    {localTranscript}
                  </div>
                )}
                {isActiveInstance && interimTranscript && (
                  <div className="text-gray-500 italic border-l-2 border-blue-300 pl-3">
                    {interimTranscript}
                    <span className="inline-block w-1 h-4 ml-1 bg-blue-500 animate-pulse"></span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">🎙️</div>
                  <div className="text-sm">{placeholder}</div>
                  <div className="text-xs mt-1 text-gray-300">
                    버튼을 클릭하여 음성 인식을 시작하세요
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 에러 메시지 (실제 문제/실패) */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg">❌</span>
              </div>
            </div>
            <div className="flex-1">
              <h5 className="text-red-800 font-medium mb-1">음성 인식 오류</h5>
              <p className="text-red-700 text-sm leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 알림 메시지 (정보성 메시지) */}
      {notification && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">ℹ️</span>
              </div>
            </div>
            <div className="flex-1">
              <h5 className="text-blue-800 font-medium mb-1">알림</h5>
              <p className="text-blue-700 text-sm leading-relaxed">
                {notification}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 시스템 상태 대시보드 */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-gray-800 font-medium text-sm">시스템 상태</h5>
          <div className="text-xs text-gray-500" suppressHydrationWarning>
            마지막 업데이트: {!isClient ? 'Loading...' : currentTime}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                supportsContinuousListening ? 'bg-green-500' : 'bg-gray-400'
              )}
            ></div>
            <span className="text-xs text-gray-600">연속 인식</span>
            <span
              className={cn(
                'text-xs px-2 py-1 rounded-full',
                supportsContinuousListening
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              )}
            >
              {supportsContinuousListening ? '✓ 지원' : '✗ 미지원'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={cn(
                'w-2 h-2 rounded-full',
                isMicrophoneAvailable ? 'bg-green-500' : 'bg-red-500'
              )}
            ></div>
            <span className="text-xs text-gray-600">마이크</span>
            <span
              className={cn(
                'text-xs px-2 py-1 rounded-full',
                isMicrophoneAvailable
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              {isMicrophoneAvailable ? '✓ 사용가능' : '✗ 사용불가'}
            </span>
          </div>
        </div>

        {/* 추가 시스템 정보 */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>브라우저 엔진</span>
            <span suppressHydrationWarning>
              {/* hydration mismatch 방지 */}
              {!isClient
                ? 'Loading...'
                : (() => {
                    const userAgent = window.navigator.userAgent;
                    if (userAgent.includes('Chrome')) return 'Chromium';
                    if (userAgent.includes('Firefox')) return 'Gecko';
                    if (userAgent.includes('Safari')) return 'WebKit';
                    return 'Unknown';
                  })()}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Web Speech API</span>
            <span className={isAvailable ? 'text-green-600' : 'text-red-600'}>
              {isAvailable ? '✓ 지원됨' : '✗ 미지원'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

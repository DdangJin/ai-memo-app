'use client';

import React, { useState } from 'react';
import { VoiceInput } from '@/components/ui/VoiceInput';
import { Button } from '@/components/ui/Button';

// Context7 베스트 프랙티스: 음성 입력 테스트 페이지
export default function VoiceTestPage() {
  // Context7: 각 VoiceInput에 독립적인 상태 관리
  const [koTranscripts, setKoTranscripts] = useState<string[]>([]);
  const [enTranscripts, setEnTranscripts] = useState<string[]>([]);
  const [continuousTranscripts, setContinuousTranscripts] = useState<string[]>([]);
  
  const [koCurrentTranscript, setKoCurrentTranscript] = useState('');
  const [enCurrentTranscript, setEnCurrentTranscript] = useState('');
  const [continuousCurrentTranscript, setContinuousCurrentTranscript] = useState('');

  // 한국어 핸들러
  const handleKoTranscriptChange = (transcript: string) => {
    setKoCurrentTranscript(transcript);
  };

  const handleKoFinalTranscript = (finalTranscript: string) => {
    if (finalTranscript.trim()) {
      setKoTranscripts(prev => [...prev, `[KO] ${finalTranscript}`]);
      setKoCurrentTranscript('');
    }
  };

  // 영어 핸들러
  const handleEnTranscriptChange = (transcript: string) => {
    setEnCurrentTranscript(transcript);
  };

  const handleEnFinalTranscript = (finalTranscript: string) => {
    if (finalTranscript.trim()) {
      setEnTranscripts(prev => [...prev, `[EN] ${finalTranscript}`]);
      setEnCurrentTranscript('');
    }
  };

  // 연속 모드 핸들러
  const handleContinuousTranscriptChange = (transcript: string) => {
    setContinuousCurrentTranscript(transcript);
  };

  const handleContinuousFinalTranscript = (finalTranscript: string) => {
    if (finalTranscript.trim()) {
      setContinuousTranscripts(prev => [...prev, `[연속] ${finalTranscript}`]);
      setContinuousCurrentTranscript('');
    }
  };

  // Context7: 모든 히스토리 초기화
  const clearHistory = () => {
    setKoTranscripts([]);
    setEnTranscripts([]);
    setContinuousTranscripts([]);
    setKoCurrentTranscript('');
    setEnCurrentTranscript('');
    setContinuousCurrentTranscript('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Context7 베스트 프랙티스: 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            음성 인식 테스트
          </h1>
          <p className="text-gray-600">
            Web Speech API를 사용한 음성 입력 기능을 테스트해보세요.
          </p>
        </div>

        {/* Context7 베스트 프랙티스: 테스트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 한국어 테스트 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              한국어 음성 인식
            </h2>
            <VoiceInput
              language="ko-KR"
              continuous={false}
              onTranscriptChange={handleKoTranscriptChange}
              onFinalTranscript={handleKoFinalTranscript}
              placeholder="한국어로 말씀해주세요..."
            />
          </div>

          {/* 영어 테스트 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              English Speech Recognition
            </h2>
            <VoiceInput
              language="en-US"
              continuous={false}
              onTranscriptChange={handleEnTranscriptChange}
              onFinalTranscript={handleEnFinalTranscript}
              placeholder="Please speak in English..."
            />
          </div>

          {/* 연속 모드 테스트 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              연속 음성 인식 (Continuous Mode)
            </h2>
            <VoiceInput
              language="ko-KR"
              continuous={true}
              onTranscriptChange={handleContinuousTranscriptChange}
              onFinalTranscript={handleContinuousFinalTranscript}
              placeholder="연속으로 말씀해주세요. 중간에 멈춰도 계속 듣습니다..."
            />
          </div>

          {/* 결과 히스토리 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                인식 히스토리
              </h2>
              <Button
                onClick={clearHistory}
                variant="outline"
                size="sm"
                disabled={koTranscripts.length === 0 && enTranscripts.length === 0 && continuousTranscripts.length === 0}
              >
                초기화
              </Button>
            </div>

            <div className="space-y-3">
              {/* 현재 진행 중인 트랜스크립트 */}
              {koCurrentTranscript && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-600 mb-1">한국어 진행 중...</div>
                  <div className="text-gray-900">{koCurrentTranscript}</div>
                </div>
              )}
              {enCurrentTranscript && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-xs text-green-600 mb-1">English in progress...</div>
                  <div className="text-gray-900">{enCurrentTranscript}</div>
                </div>
              )}
              {continuousCurrentTranscript && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-xs text-purple-600 mb-1">연속 모드 진행 중...</div>
                  <div className="text-gray-900">{continuousCurrentTranscript}</div>
                </div>
              )}

              {/* 완료된 트랜스크립트들 */}
              {(() => {
                const allTranscripts = [
                  ...koTranscripts,
                  ...enTranscripts,
                  ...continuousTranscripts
                ];
                return allTranscripts.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {allTranscripts.reverse().map((transcript, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="text-xs text-gray-500 mb-1">
                          #{allTranscripts.length - index}
                        </div>
                        <div className="text-gray-900">{transcript}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    <p>아직 인식된 음성이 없습니다.</p>
                    <p className="text-sm">위의 음성 입력을 시도해보세요.</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Context7 베스트 프랙티스: 사용법 안내 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📋 사용법 안내
          </h3>
          <div className="space-y-2 text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="font-medium">1.</span>
              <span>마이크 권한을 허용해주세요.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">2.</span>
              <span>원하는 언어의 &apos;시작&apos; 버튼을 클릭하세요.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">3.</span>
              <span>명확하게 말씀해주세요.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-medium">4.</span>
              <span>
                일반 모드는 말을 멈추면 자동으로 종료되고, 연속 모드는 수동으로
                중지해야 합니다.
              </span>
            </div>
          </div>
        </div>

        {/* Context7 베스트 프랙티스: 브라우저 호환성 안내 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            🌐 브라우저 호환성
          </h3>
          <div className="space-y-2 text-yellow-800">
            <div>
              <strong>지원:</strong> Chrome, Edge, Safari (일부 제한)
            </div>
            <div>
              <strong>미지원:</strong> Firefox (Web Speech API 미지원)
            </div>
            <div>
              <strong>권장:</strong> 최신 버전의 Chrome 또는 Edge 사용
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

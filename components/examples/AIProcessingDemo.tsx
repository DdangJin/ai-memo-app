import React, { useState } from 'react';
import { useAIProcessing } from '@/hooks/use-ai-processing';
import { AIActionButton, AIStatusIndicator, AIToast } from '@/components/ai';
import { SkeletonLoader, ProgressBar } from '@/components/ui';
import { MemoCard, MemoListSkeleton } from '@/components/memo';

// Context7 패턴: AI 처리 시스템 데모 및 테스트 컴포넌트
export const AIProcessingDemo: React.FC = () => {
  const [testContent, setTestContent] = useState(
    '이것은 테스트용 메모입니다. AI 처리를 테스트해보겠습니다.'
  );
  const [testMemoId] = useState('demo-memo-123');

  const {
    processSummarization,
    processClassification,
    processGeneralMessage,
    isGlobalLoading,
    isSummarizationLoading,
    isClassificationLoading,
    isGeneralMessageLoading,
  } = useAIProcessing();

  const handleSummarize = async () => {
    const result = await processSummarization(testMemoId, testContent);
    console.log('요약 결과:', result);
  };

  const handleClassify = async () => {
    const result = await processClassification(testMemoId, testContent);
    console.log('분류 결과:', result);
  };

  const handleGeneralMessage = async () => {
    const result = await processGeneralMessage(
      '안녕하세요! 간단한 인사말을 해주세요.'
    );
    console.log('일반 메시지 결과:', result);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">AI 처리 시스템 데모</h2>

        {/* 전역 상태 표시 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">전역 상태</h3>
          <div className="flex items-center gap-4">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                isGlobalLoading
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isGlobalLoading ? '처리 중' : '대기 중'}
            </span>
            <AIStatusIndicator />
          </div>
        </div>

        {/* 테스트 콘텐츠 입력 */}
        <div className="mb-6">
          <label
            htmlFor="test-content"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            테스트 콘텐츠
          </label>
          <textarea
            id="test-content"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={testContent}
            onChange={e => setTestContent(e.target.value)}
            placeholder="AI 처리를 테스트할 콘텐츠를 입력하세요..."
          />
        </div>

        {/* AI 작업 버튼들 */}
        <div className="space-y-4">
          {/* 요약 섹션 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">메모 요약</h4>
              <p className="text-sm text-gray-600">메모 내용을 요약합니다</p>
              <AIStatusIndicator type="summarization" className="mt-2" />
            </div>
            <AIActionButton
              aiType="summarization"
              loadingText="요약 중..."
              onClick={handleSummarize}
              disabled={!testContent.trim()}
            >
              요약하기
            </AIActionButton>
          </div>

          {/* 분류 섹션 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">메모 분류</h4>
              <p className="text-sm text-gray-600">
                메모를 카테고리별로 분류합니다
              </p>
              <AIStatusIndicator type="classification" className="mt-2" />
            </div>
            <AIActionButton
              aiType="classification"
              loadingText="분류 중..."
              onClick={handleClassify}
              disabled={!testContent.trim()}
            >
              분류하기
            </AIActionButton>
          </div>

          {/* 일반 메시지 섹션 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">일반 AI 메시지</h4>
              <p className="text-sm text-gray-600">
                Claude AI와 간단한 대화를 나눕니다
              </p>
              <AIStatusIndicator type="general" className="mt-2" />
            </div>
            <AIActionButton
              aiType="general"
              loadingText="처리 중..."
              onClick={handleGeneralMessage}
            >
              메시지 보내기
            </AIActionButton>
          </div>
        </div>

        {/* 개별 상태 정보 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">개별 상태</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">요약:</span>
              <span
                className={`ml-2 ${isSummarizationLoading ? 'text-blue-600' : 'text-gray-600'}`}
              >
                {isSummarizationLoading ? '진행 중' : '대기 중'}
              </span>
            </div>
            <div>
              <span className="font-medium">분류:</span>
              <span
                className={`ml-2 ${isClassificationLoading ? 'text-blue-600' : 'text-gray-600'}`}
              >
                {isClassificationLoading ? '진행 중' : '대기 중'}
              </span>
            </div>
            <div>
              <span className="font-medium">일반:</span>
              <span
                className={`ml-2 ${isGeneralMessageLoading ? 'text-blue-600' : 'text-gray-600'}`}
              >
                {isGeneralMessageLoading ? '진행 중' : '대기 중'}
              </span>
            </div>
          </div>
        </div>

        {/* UI 컴포넌트 데모 */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-900 mb-4">
            로딩 인디케이터 데모
          </h4>

          {/* 스켈레톤 로더 데모 */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              스켈레톤 로더
            </h5>
            <div className="space-y-2">
              <SkeletonLoader />
              <SkeletonLoader lines={3} />
              <SkeletonLoader width="half" />
            </div>
          </div>

          {/* 프로그레스 바 데모 */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              프로그레스 바
            </h5>
            <div className="space-y-2">
              <ProgressBar value={30} showLabel label="요약 진행률" />
              <ProgressBar
                value={70}
                variant="success"
                showLabel
                label="분류 진행률"
              />
              <ProgressBar indeterminate showLabel label="처리 중..." />
            </div>
          </div>

          {/* 메모 카드 데모 */}
          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              메모 카드 (AI 통합)
            </h5>
            <MemoCard
              memo={{
                id: 'demo-card-1',
                title: '데모 메모',
                content: testContent,
                category: 'demo',
                aiSummary: null,
                hasSummary: false,
                canSummarize: true,
                hasClassification: false,
                canClassify: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }}
              className="max-w-md"
            />
          </div>

          {/* 메모 리스트 스켈레톤 데모 */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              메모 리스트 스켈레톤
            </h5>
            <MemoListSkeleton count={2} className="max-w-md" />
          </div>
        </div>

        {/* 사용법 안내 */}
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <h4 className="font-medium text-yellow-900 mb-2">사용법 안내</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 각 버튼을 클릭하면 해당 AI 작업이 시작됩니다</li>
            <li>• 작업 중에는 버튼이 비활성화되고 로딩 스피너가 표시됩니다</li>
            <li>• 성공/실패 메시지는 우상단 토스트로 표시됩니다</li>
            <li>• 브라우저 개발자 도구 콘솔에서 결과를 확인할 수 있습니다</li>
            <li>
              • 다양한 로딩 인디케이터와 스켈레톤 로더를 확인할 수 있습니다
            </li>
          </ul>
        </div>
      </div>

      {/* AI 토스트 (전역적으로 표시) */}
      <AIToast />
    </div>
  );
};

AIProcessingDemo.displayName = 'AIProcessingDemo';

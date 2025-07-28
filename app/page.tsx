export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            📝 Memora
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            AI 음성 메모장 웹서비스
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              🚀 개발 진행 중
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Next.js 14, TypeScript, TailwindCSS로 구축되는 AI 기반 음성 메모
              애플리케이션입니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  🎯 주요 기능
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• 음성 메모 녹음</li>
                  <li>• AI 자동 요약</li>
                  <li>• 스마트 분류</li>
                  <li>• 실시간 동기화</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  🛠️ 기술 스택
                </h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Next.js 14</li>
                  <li>• TypeScript</li>
                  <li>• TailwindCSS</li>
                  <li>• Supabase</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

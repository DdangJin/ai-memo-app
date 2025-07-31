import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // X-Powered-By 헤더 비활성화 (보안 정보 노출 방지)
  poweredByHeader: false,

  // 보안 헤더 설정 (Context7 OWASP 베스트 프랙티스)
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // 개발 환경에서는 CSP를 비활성화하여 개발 도구와 호환성 확보
    const cspHeaders = isDevelopment
      ? []
      : [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' ws: wss:",
              "media-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ];

    return [
      {
        source: '/(.*)',
        headers: [
          ...cspHeaders,
          // MIME 타입 스니핑 방지
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // 클릭재킹 방지
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // HTTPS 강제 (프로덕션)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // 레퍼러 정책 (개인정보 보호)
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Cross-Origin 정책
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          // DNS 프리페치 제어
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'off',
          },
          // 권한 정책 (민감한 API 차단)
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

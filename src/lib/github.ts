/**
 * GitHub Issues 연동
 * 리뷰 코멘트 → GitHub Issue 자동 생성/동기화
 */

const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'teraflow-net/EverMarine'
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''

const PAGE_LABELS: Record<string, string> = {
  '/': '대시보드',
  '/rfq': '견적 관리',
  '/po': '발주 관리',
  '/email': '이메일 센터',
  '/customers': '매출처',
  '/suppliers': '매입처',
  '/vessels': '선박 관리',
  '/prices': '단가 조회',
  '/supplier-prices': '품목단가',
  '/settings': '설정',
}

function getPageLabel(url: string): string {
  if (PAGE_LABELS[url]) return PAGE_LABELS[url]
  if (url.startsWith('/rfq/')) return `견적 상세 ${url.split('/').pop()}`
  if (url.startsWith('/po/')) return `발주 상세 ${url.split('/').pop()}`
  return url
}

export async function createGitHubIssue(params: {
  pageUrl: string
  xPercent: number
  yPercent: number
  content: string
  authorName: string
  imageUrl?: string | null
}): Promise<number | null> {
  if (!GITHUB_TOKEN) {
    console.warn('VITE_GITHUB_TOKEN not set — skipping GitHub Issue creation')
    return null
  }

  const pageLabel = getPageLabel(params.pageUrl)
  const siteUrl = window.location.origin

  const title = `[리뷰] ${pageLabel}: ${params.content.slice(0, 60)}${params.content.length > 60 ? '...' : ''}`

  const body = `## 리뷰 피드백

| 항목 | 값 |
|------|-----|
| **페이지** | [${pageLabel}](${siteUrl}${params.pageUrl}) (\`${params.pageUrl}\`) |
| **위치** | x: ${params.xPercent.toFixed(1)}%, y: ${params.yPercent.toFixed(1)}% |
| **작성자** | ${params.authorName} |
| **등록일** | ${new Date().toLocaleDateString('ko-KR')} |

### 내용

${params.content}
${params.imageUrl ? `\n### 첨부 이미지\n![첨부](${params.imageUrl})` : ''}

---
_🔍 리뷰 모드에서 자동 생성된 Issue입니다._`

  const labels = ['review-feedback', `page:${params.pageUrl}`]

  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ title, body, labels }),
    })

    if (!res.ok) {
      console.error('GitHub Issue creation failed:', res.status, await res.text())
      return null
    }

    const data = await res.json()
    return data.number
  } catch (err) {
    console.error('GitHub Issue creation error:', err)
    return null
  }
}

export async function closeGitHubIssue(issueNumber: number): Promise<void> {
  if (!GITHUB_TOKEN) return

  try {
    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ state: 'closed' }),
    })
  } catch (err) {
    console.error('GitHub Issue close error:', err)
  }
}

export async function reopenGitHubIssue(issueNumber: number): Promise<void> {
  if (!GITHUB_TOKEN) return

  try {
    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({ state: 'open' }),
    })
  } catch (err) {
    console.error('GitHub Issue reopen error:', err)
  }
}

# BTC Cycle Dashboard — Z-MVRV

매일 아침 한 번, 비트코인 Z-MVRV를 한 화면에서. 무료 데이터, 서버 없음, $0.

- `index.html` — 대시보드 (더블클릭으로 열림)
- `scripts/collect.js` — 하루 1회 데이터 수집기 (`node scripts/collect.js`, Node 18+, 설치 패키지 없음)
- `data/zmvrv.csv` — 2011-07-18부터의 일별 Z-MVRV (`date,value,status,source,note`)
- `.github/workflows/daily.yml` — GitHub Actions에서 매일 02:30 UTC 자동 실행

## GitHub에 올려서 자동화하기 (W3)
1. GitHub에 **public** 저장소를 만들고 이 폴더를 push
2. Settings → Pages → Source: `main` / root → 저장. 몇 분 뒤 `https://<계정>.github.io/<저장소>/` 에서 열림
3. Actions 탭 → `daily-zmvrv` → **Run workflow** 로 한 번 수동 실행해서 초록불 확인
4. 이후엔 매일 자동. 실패하면 Actions 탭에 빨간불 + 페이지 상단 배너

## 문서
PRD → TRD → UI → ADR-001~004 → ROADMAP.md (진행 상황은 ROADMAP.md 상단 status board)

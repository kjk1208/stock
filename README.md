# 미국 주식 자동매매 베이스 프로젝트

Alpaca Markets Paper API에 연결된 FastAPI 백엔드와 React + TypeScript 기반 대시보드를 함께 제공하는 샘플입니다. 계좌/포지션 조회, 주문 생성·취소, 단순 이평선 전략 실행을 REST API로 노출하고, 세련된 다크 테마 UI에서 실시간 상태를 모니터링할 수 있습니다.

## 기술 스택
- **Backend**: Python 3.11+, FastAPI, httpx, pytest
- **전략/리스크**: 사용자 정의 Strategy/Risk 모듈, SMA 교차 전략 샘플
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Recharts, Lucide Icons
- **Data Layer**: SQLAlchemy 2 + SQLite(aiosqlite)로 전략 실행 로그 보존
- **Broker**: Alpaca Paper API (실계좌 전환에도 동일 구조 사용 가능)

## 폴더 구조
```
stock/
├─ README.md
├─ backend/
│  ├─ .env.example
│  ├─ requirements.txt
│  ├─ app/
│  │  ├─ config.py
│  │  ├─ db.py
│  │  ├─ engine.py
│  │  ├─ main.py
│  │  ├─ models.py
│  │  ├─ repositories.py
│  │  ├─ risk.py
│  │  ├─ schemas.py
│  │  ├─ services/
│  │  └─ strategies/
│  └─ tests/
└─ frontend/
   ├─ .env.example
   ├─ package.json
   ├─ index.html
   └─ src/
```

## Backend 빠른 시작
1. Python 3.11+ 환경 준비 후 가상환경 활성화
   ```powershell
   cd backend
   conda activate stock   # 또는 python -m venv .venv
   pip install -r requirements.txt
   ```
2. 환경 변수 설정
   ```powershell
   copy .env.example .env
   # ALPACA 키/시크릿 입력, DATABASE_URL 기본값은 sqlite+aiosqlite:///./alpaca.db
   ```
3. FastAPI 서버 실행
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```
4. Swagger 문서: `http://localhost:8000/docs`

### 전략 실행 API
- **Endpoint**: `POST /api/v1/strategies/run`
- **Body 예시**
  ```json
  {
    "symbol": "AAPL",
    "qty": 1,
    "fast_window": 5,
    "slow_window": 20,
    "timeframe": "1Min",
    "execute": false
  }
  ```
- **동작**: Alpaca Data API에서 캔들을 조회 → SMA 교차 전략 평가 → 리스크 한도 검증 → 주문 제안(옵션으로 즉시 주문)

### 테스트
```powershell
cd backend
pytest
```
- `tests/test_strategy.py`: 전략 시그널 케이스 검증
- `tests/test_risk.py`: 주문 수량/명목 한도 검증
- 전략 실행 시 `backend/alpaca.db`(SQLite)에 로그가 자동 적재돼 이력 추적 가능

## Frontend 대시보드
Tailwind 기반 글래스모피즘 스타일을 적용한 단일 페이지 앱으로 계좌 지표, 포지션 테이블, 전략 실행 패널, 가격 차트를 제공합니다.

1. 의존성 설치
   ```powershell
   cd frontend
   npm install
   ```
2. 환경 변수 설정
   ```powershell
   copy .env.example .env
   # 기본값은 http://localhost:8000 (FastAPI dev 서버)
   ```
3. 개발 서버 실행
   ```powershell
   npm run dev
   ```
4. 브라우저에서 `http://localhost:5173` 접속 → 백엔드 REST를 소비하며 실시간 데이터 렌더링

### 주요 UI 섹션
- **Hero/Header**: 시장 오픈 상태, 다음 거래 시작 시각, 브랜드 아이덴티티
- **Insight Cards**: Portfolio Value / Buying Power / Cash를 그라데이션 톤으로 강조
- **Positions Table**: 실시간 포지션 리스트, PnL 색상 강조, 반응형 테이블
- **Strategy Panel**: SMA 파라미터·즉시 주문 옵션 제어, 실행 결과 및 주문 제안 표시
- **Trend Chart**: Recharts AreaChart로 전략 실행 결과 혹은 기본 가격 흐름 시각화

## 향후 확장 아이디어
1. **다중 전략 스케줄러**: Momentum, Bollinger 등 추가 전략을 `strategies/`에 구현하고 스케줄링 엔진 작성
2. **WebSocket 실시간 알림**: 체결/포지션 변동을 push하여 대시보드·모바일에 동시에 전파
3. **백테스트 파이프라인**: 히스토리컬 데이터셋과 통합해 전략 성능을 자동 리포트화
4. **배포 자동화**: Docker/K8s 기반 CI/CD, Observability(ELK, Prometheus, Grafana) 연동

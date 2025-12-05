// Supabase API 설정
const SUPABASE_URL = 'https://rpxcrfyiqnhucktdxlbh.supabase.co';
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJweGNyZnlpcW5odWNrdGR4bGJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NjcxNzYsImV4cCI6MjA1OTI0MzE3Nn0.Fol1O7W0wfXRahy-LRCDhsKrYeMPoF64HC55S9h6-PQ';
const AUTH_TOKEN_KEY = 'erp_supabase_auth_token';
const REFRESH_TOKEN_KEY = 'erp_supabase_refresh_token';
const AUTO_LOGIN_KEY = 'erp_auto_login_enabled';
const SAVED_EMAIL_KEY = 'erp_saved_email';
const SAVED_PASSWORD_KEY = 'erp_saved_password';

// 기본 로그인 정보
const DEFAULT_EMAIL = 'eunchong.seong@ex-techkorea.com';
const DEFAULT_PASSWORD = 'as261354!';

// 기본 토큰 (fallback)
const DEFAULT_AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6Imtjc3FSN0RBS0lVYjZpaFQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3JweGNyZnlpcW5odWNrdGR4bGJoLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIyODg3Njg0MC04NmNkLTQ0YzEtYThmZC00NjUyZDUzYzZjNDQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzY0ODI2Mjk5LCJpYXQiOjE3NjQ4MjI2OTksImVtYWlsIjoiY29kZXVuMjJAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImNvZGV1bjIyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjI4ODc2ODQwLTg2Y2QtNDRjMS1hOGZkLTQ2NTJkNTNjNmM0NCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzY0ODIyNjk5fV0sInNlc3Npb25faWQiOiIzMjI4ZWY2OC1mNzI2LTRmN2QtOTlhYS1kYjBhZjBjZDhkNWUiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.D6EuULPkCW8cp9yRBU-0QytxlvtDYWKQBk4M5aaQ9xo';

// 토큰 가져오기 (localStorage 우선, 없으면 기본값)
function getAuthToken() {
    const saved = localStorage.getItem(AUTH_TOKEN_KEY);
    return saved || DEFAULT_AUTH_TOKEN;
}

// 토큰 저장
function setAuthToken(token) {
    // Bearer 접두사가 없으면 추가
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    localStorage.setItem(AUTH_TOKEN_KEY, formattedToken);
    console.log('인증 토큰이 업데이트되었습니다.');
}

// Refresh Token 저장
function setRefreshToken(token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

// Refresh Token 가져오기
function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// 자동 로그인 설정 저장
function setAutoLogin(enabled) {
    localStorage.setItem(AUTO_LOGIN_KEY, enabled ? 'true' : 'false');
}

// 자동 로그인 설정 가져오기
function getAutoLogin() {
    const saved = localStorage.getItem(AUTO_LOGIN_KEY);
    // 저장된 값이 없으면 기본값 true 반환 (자동 로그인 기본 활성화)
    if (saved === null) {
        return true;
    }
    return saved === 'true';
}

// 로그인 정보 저장
function saveLoginInfo(email, password) {
    localStorage.setItem(SAVED_EMAIL_KEY, email);
    localStorage.setItem(SAVED_PASSWORD_KEY, password);
}

// 저장된 로그인 정보 가져오기
function getSavedLoginInfo() {
    const email = localStorage.getItem(SAVED_EMAIL_KEY) || DEFAULT_EMAIL;
    const password = localStorage.getItem(SAVED_PASSWORD_KEY) || DEFAULT_PASSWORD;
    return { email, password };
}

// 자동 로그인 시도
async function tryAutoLogin() {
    if (!getAutoLogin()) {
        return false;
    }
    
    try {
        const { email, password } = getSavedLoginInfo();
        console.log('자동 로그인 시도 중...');
        await loginWithEmail(email, password);
        console.log('자동 로그인 성공!');
        updateLoginStatus(); // 로그인 상태 업데이트
        return true;
    } catch (error) {
        console.error('자동 로그인 실패:', error);
        updateLoginStatus(); // 로그인 상태 업데이트
        return false;
    }
}

// JWT 토큰 디코딩 (expiration 확인용)
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}

// 로그인 상태 확인 및 업데이트
function updateLoginStatus() {
    const statusElement = document.getElementById('login-status');
    if (!statusElement) return;
    
    const refreshToken = getRefreshToken();
    const authToken = getAuthToken();
    
    // Refresh token이 있으면 로그인된 것으로 간주
    if (refreshToken) {
        // Access token의 만료 시간 확인
        try {
            const tokenWithoutBearer = authToken.replace(/^Bearer\s+/, '');
            const decoded = decodeJWT(tokenWithoutBearer);
            
            if (decoded && decoded.exp) {
                const expirationTime = decoded.exp * 1000; // 초를 밀리초로 변환
                const currentTime = Date.now();
                const isExpired = currentTime >= expirationTime;
                
                if (isExpired) {
                    // 만료되었지만 refresh token이 있으면 자동 갱신 가능
                    statusElement.className = 'login-status logged-in';
                    statusElement.textContent = '로그인됨 (갱신 예정)';
                } else {
                    // 유효한 토큰
                    const email = decoded.email || decoded.user_metadata?.email || '사용자';
                    statusElement.className = 'login-status logged-in';
                    statusElement.textContent = `로그인됨 (${email})`;
                }
            } else {
                statusElement.className = 'login-status logged-in';
                statusElement.textContent = '로그인됨';
            }
        } catch (error) {
            // 토큰 파싱 실패해도 refresh token이 있으면 로그인된 것으로 간주
            statusElement.className = 'login-status logged-in';
            statusElement.textContent = '로그인됨';
        }
    } else {
        // Refresh token이 없으면 로그인 안 됨
        statusElement.className = 'login-status logged-out';
        statusElement.textContent = '로그인 필요';
    }
}

// Supabase 로그인 함수
async function loginWithEmail(email, password) {
    try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error_description || errorData.message || '로그인에 실패했습니다.');
        }

        const data = await response.json();
        
        // access_token 저장
        if (data.access_token) {
            setAuthToken(data.access_token);
        }
        
        // refresh_token 저장
        if (data.refresh_token) {
            setRefreshToken(data.refresh_token);
        }
        
        // 로그인 상태 업데이트
        updateLoginStatus();
        
        return data;
    } catch (error) {
        console.error('로그인 오류:', error);
        throw error;
    }
}

// 토큰 자동 갱신 함수 (refresh token 사용)
async function refreshAuthToken() {
    try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            throw new Error('Refresh token이 없습니다. 다시 로그인해주세요.');
        }

        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh_token: refreshToken
            })
        });

        if (!response.ok) {
            throw new Error('토큰 갱신에 실패했습니다.');
        }

        const data = await response.json();
        
        // 새 access_token 저장
        if (data.access_token) {
            setAuthToken(data.access_token);
        }
        
        // 새 refresh_token 저장 (있으면)
        if (data.refresh_token) {
            setRefreshToken(data.refresh_token);
        }
        
        // 로그인 상태 업데이트
        updateLoginStatus();
        
        return data;
    } catch (error) {
        console.error('토큰 갱신 오류:', error);
        throw error;
    }
}

const USER_ID = 'f2f80b9a-b99c-4d99-96f0-47fad0fc6348';
const STORAGE_KEY = 'erp_attendance_last_fetch_date';
const DATA_STORAGE_KEY = 'erp_attendance_data';
const AUTO_ATTENDANCE_KEY = 'erp_auto_attendance_enabled';
const VACATION_DATES_KEY = 'erp_vacation_dates';
const AUTO_CHECKIN_DATES_KEY = 'erp_auto_checkin_dates';

// 고정된 주소와 IP
const FIXED_CHECK_IN_ADDRESS = '좌수영로, 수영동, 수영구, 부산광역시, 48058, 대한민국';
const FIXED_CHECK_IN_IP = '218.235.89.145';
const FIXED_CHECK_IN_LOCATION = '35.1678779,129.1231357';

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 주말 여부 확인 (토요일=6, 일요일=0)
function isWeekend(dateString = null) {
    const date = dateString ? new Date(dateString + 'T00:00:00') : new Date();
    const day = date.getDay(); // 0=일요일, 6=토요일
    return day === 0 || day === 6;
}

// 오늘 이미 데이터를 가져왔는지 확인
function shouldAutoFetch() {
    const lastFetchDate = localStorage.getItem(STORAGE_KEY);
    const today = getTodayDateString();
    
    console.log('=== 자동 요청 확인 ===');
    console.log('마지막 요청 날짜:', lastFetchDate);
    console.log('오늘 날짜:', today);
    
    // 오늘 날짜와 다르면 자동 요청 필요
    if (lastFetchDate !== today) {
        console.log('자동 요청이 필요합니다.');
        return true;
    }
    
    console.log('오늘은 이미 요청했습니다. 자동 요청을 건너뜁니다.');
    return false;
}

// 오늘 날짜를 localStorage에 저장
function saveFetchDate() {
    const today = getTodayDateString();
    localStorage.setItem(STORAGE_KEY, today);
    console.log('요청 날짜 저장:', today);
}

// 시간 포맷 함수 (마지막 새로고침 시간 표시용)
function formatRefreshTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// 마지막 새로고침 시간 업데이트
function updateLastRefreshTime(elementId) {
    const timeElement = document.getElementById(elementId);
    if (timeElement) {
        const timeStr = formatRefreshTime();
        timeElement.textContent = `마지막 새로고침: ${timeStr}`;
    }
}

// 자동 상태 표시 업데이트
function updateAutoStatus(status, message = '') {
    const statusElement = document.getElementById('auto-status');
    if (!statusElement) return;
    
    // 기존 클래스 제거
    statusElement.className = 'auto-status';
    
    switch(status) {
        case 'loading':
            statusElement.classList.add('loading');
            statusElement.textContent = '자동 데이터 가져오는 중...';
            break;
        case 'completed':
            statusElement.classList.add('completed');
            const lastFetchDate = localStorage.getItem(STORAGE_KEY);
            const time = lastFetchDate ? new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';
            statusElement.textContent = `✓ 자동 데이터 가져오기 완료 ${time ? `(${time})` : ''}`;
            break;
        case 'not-needed':
            statusElement.classList.add('completed');
            statusElement.textContent = '✓ 오늘은 이미 데이터를 가져왔습니다';
            break;
        case 'error':
            statusElement.classList.add('error');
            statusElement.textContent = message || '✗ 데이터 가져오기 실패';
            break;
        default:
            statusElement.textContent = '';
    }
}

// 데이터를 localStorage에 저장
function saveAttendanceData(data) {
    try {
        localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
        console.log('데이터를 localStorage에 저장했습니다.');
    } catch (error) {
        console.error('데이터 저장 중 오류:', error);
    }
}

// localStorage에서 데이터 불러오기
function loadAttendanceData() {
    try {
        const savedData = localStorage.getItem(DATA_STORAGE_KEY);
        if (savedData) {
            const data = JSON.parse(savedData);
            console.log('localStorage에서 데이터를 불러왔습니다.');
            return data;
        }
    } catch (error) {
        console.error('데이터 불러오기 중 오류:', error);
    }
    return null;
}

// 출퇴근 데이터를 가져오는 함수
async function fetchAttendanceData(isAutoFetch = false) {
    const tbody = document.getElementById('attendance-tbody');
    const fetchBtn = document.getElementById('fetch-btn');
    
    // 로딩 상태 표시
    fetchBtn.disabled = true;
    fetchBtn.classList.add('loading');
    const originalBtnContent = fetchBtn.innerHTML;
    fetchBtn.innerHTML = '<span class="refresh-icon">🔄</span> 데이터 불러오는 중...';
    
    // 자동 요청인 경우 상태 표시
    if (isAutoFetch) {
        updateAutoStatus('loading');
    }
    
    // 기존 데이터가 있으면 유지하고, 없으면 로딩 메시지 표시
    const existingRows = tbody.querySelectorAll('tr');
    if (existingRows.length === 0 || existingRows[0].classList.contains('empty-message')) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="9" class="loading-message">데이터를 불러오는 중...</td>
            </tr>
        `;
    }
    
    // 로딩 오버레이 추가 (깜빡임 방지)
    let loadingOverlay = document.getElementById('attendance-loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'attendance-loading-overlay';
        loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 10; pointer-events: none; opacity: 0; transition: opacity 0.3s;';
        const tableContainer = tbody.closest('.table-container');
        if (tableContainer) {
            tableContainer.style.position = 'relative';
            tableContainer.appendChild(loadingOverlay);
        }
    }
    loadingOverlay.style.opacity = '1';
    
    try {
        // work_histories 테이블에서 출퇴근 데이터를 가져오는 API 호출
        const apiUrl = `${SUPABASE_URL}/rest/v1/work_histories?user_id=eq.${USER_ID}&select=*&order=created_at.desc`;
        
        console.log('=== API 요청 정보 ===');
        console.log('URL:', apiUrl);
        console.log('USER_ID:', USER_ID);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_API_KEY,
                'Authorization': getAuthToken(),
                'Accept': 'application/json',
                'Accept-Profile': 'public',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        });

        console.log('=== API 응답 정보 ===');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('=== API 오류 응답 ===');
            console.error('Error Text:', errorText);
            
            // JWT 만료 오류 처리
            if (response.status === 401) {
                // 먼저 refresh token으로 자동 갱신 시도
                try {
                    await refreshAuthToken();
                    // 토큰 갱신 성공하면 재시도
                    console.log('토큰이 자동으로 갱신되었습니다. 재시도합니다.');
                    // 재귀 호출로 재시도
                    return fetchAttendanceData(isAutoFetch);
                } catch (refreshError) {
                    console.log('토큰 자동 갱신 실패:', refreshError);
                    // 갱신 실패 시 자동 로그인 시도
                    const autoLoginSuccess = await tryAutoLogin();
                    if (autoLoginSuccess) {
                        console.log('자동 로그인 성공. 재시도합니다.');
                        return fetchAttendanceData(isAutoFetch);
                    }
                    
                    // 자동 로그인도 실패하면 모달 표시
                    try {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.message && errorJson.message.includes('JWT expired')) {
                            setTimeout(() => {
                                showTokenExpiredModal();
                            }, 100);
                            throw new Error('인증 토큰이 만료되었습니다. 로그인하거나 새 토큰을 입력해주세요.');
                        }
                    } catch (parseError) {
                        setTimeout(() => {
                            showTokenExpiredModal();
                        }, 100);
                        throw new Error('인증 토큰이 만료되었거나 유효하지 않습니다. 로그인하거나 새 토큰을 입력해주세요.');
                    }
                }
            }
            
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        
        console.log('=== 받아온 데이터 ===');
        console.log('데이터 타입:', Array.isArray(data) ? 'Array' : typeof data);
        console.log('데이터 개수:', Array.isArray(data) ? data.length : 'N/A');
        console.log('전체 데이터:', JSON.stringify(data, null, 2));
        
        if (Array.isArray(data) && data.length > 0) {
            console.log('=== 첫 번째 레코드 구조 분석 ===');
            console.log('첫 번째 레코드:', data[0]);
            console.log('컬럼 목록:', Object.keys(data[0]));
            console.log('각 컬럼의 값:');
            Object.keys(data[0]).forEach(key => {
                console.log(`  - ${key}:`, data[0][key], `(타입: ${typeof data[0][key]})`);
            });
        }
        
        displayAttendanceData(data);
        
        // 성공적으로 데이터를 가져왔으면 localStorage에 저장
        saveAttendanceData(data);
        saveFetchDate();
        
        // 마지막 새로고침 시간 업데이트
        updateLastRefreshTime('last-refresh-time');
        
        // 자동 요청인 경우 완료 상태 표시
        if (isAutoFetch) {
            updateAutoStatus('completed');
        }
        
        // 자동 출퇴근이 활성화되어 있고, 오늘 기록이 없으면 자동 출근 체크
        if (isAutoAttendanceEnabled()) {
            checkTodayAndAutoCheckIn(data);
        }
    } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error);
        
        let errorMessage = error.message;
        let isTokenError = false;
        
        if (error.message.includes('JWT expired') || error.message.includes('인증 토큰') || error.message.includes('401')) {
            errorMessage = '인증 토큰이 만료되었습니다. 🔑 버튼을 클릭하여 토큰을 업데이트해주세요.';
            isTokenError = true;
            // 토큰 모달 표시
            setTimeout(() => {
                showTokenExpiredModal();
            }, 100);
        }
        
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-message">
                    데이터를 불러올 수 없습니다.<br>
                    <small style="color: ${isTokenError ? '#ef4444' : '#9ca3af'}; font-size: 0.9rem;">${errorMessage}</small>
                    ${isTokenError ? '<br><small style="color: #6b7280; font-size: 0.85rem;">상단의 🔑 버튼을 클릭하여 새 토큰을 입력하세요.</small>' : ''}
                </td>
            </tr>
        `;
        
        // 자동 요청인 경우 오류 상태 표시
        if (isAutoFetch) {
            updateAutoStatus('error', errorMessage);
        }
    } finally {
        // 로딩 오버레이 제거
        const loadingOverlay = document.getElementById('attendance-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.parentNode.removeChild(loadingOverlay);
                }
            }, 300);
        }
        
        // 버튼 상태 복원
        fetchBtn.disabled = false;
        fetchBtn.classList.remove('loading');
        fetchBtn.innerHTML = originalBtnContent || '<span class="refresh-icon">🔄</span> 출퇴근 데이터 가져오기';
    }
}

// 출퇴근 데이터를 테이블에 표시하는 함수
function displayAttendanceData(data) {
    const tbody = document.getElementById('attendance-tbody');
    
    console.log('=== displayAttendanceData 호출 ===');
    console.log('받은 데이터:', data);
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
        console.log('데이터가 없습니다.');
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-message">출퇴근 데이터가 없습니다.</td>
            </tr>
        `;
        return;
    }

    // 배열이 아닌 경우 배열로 변환
    const records = Array.isArray(data) ? data : [data];
    
    console.log('=== 데이터 매핑 시작 ===');
    console.log('총 레코드 수:', records.length);

    tbody.innerHTML = records.map((record, index) => {
        console.log(`\n--- 레코드 ${index + 1} 처리 ---`);
        console.log('원본 레코드:', record);
        
        // work_histories 테이블의 실제 컬럼명 사용
        const date = formatDate(record.check_in || record.created_at);
        const checkIn = formatTime(record.check_in);
        const checkOut = formatTime(record.check_out);
        const checkInLocation = record.check_in_address || record.check_in_location || '-';
        const checkOutLocation = record.check_out_address || record.check_out_location || '-';
        const checkInIP = record.check_in_ip || '-';
        const checkOutIP = record.check_out_ip || '-';
        const sequenceNumber = records.length - index; // 역순으로 순번 표시
        
        // 자동 출근 여부 확인
        const recordDate = record.check_in || record.created_at;
        const dateString = recordDate ? recordDate.split('T')[0] : '';
        const isAutoCheckIn = isAutoCheckInDate(dateString);
        
        console.log('포맷팅된 값:');
        console.log('  - 순번:', sequenceNumber);
        console.log('  - 날짜:', date);
        console.log('  - 출근:', checkIn);
        console.log('  - 퇴근:', checkOut);
        console.log('  - 출근위치:', checkInLocation);
        console.log('  - 퇴근위치:', checkOutLocation);
        console.log('  - 출근IP:', checkInIP);
        console.log('  - 퇴근IP:', checkOutIP);
        console.log('  - 자동출근:', isAutoCheckIn);

        return `
            <tr>
                <td>${sequenceNumber}</td>
                <td>${date}</td>
                <td>${checkIn || '-'}</td>
                <td>${checkOut || '-'}</td>
                <td>${checkInLocation}</td>
                <td>${checkOutLocation}</td>
                <td>${checkInIP}</td>
                <td>${checkOutIP}</td>
                <td>${isAutoCheckIn ? '<span class="auto-checkin-badge">✓ 자동출근 완료</span>' : '-'}</td>
            </tr>
        `;
    }).join('');
    
    console.log('=== 테이블 렌더링 완료 ===');
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}-${month}-${day} (${weekday})`;
}

// 시간 포맷팅
function formatTime(timeString) {
    if (!timeString) return '-';
    const date = new Date(timeString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 신청일 포맷팅 (yy/mm/dd hh:mm) - 한국 시간 기준
function formatCreatedAt(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    
    // 한국 시간으로 변환 (UTC+9)
    const koreaTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    
    const year = String(koreaTime.getFullYear()).slice(-2); // 뒤 2자리만
    const month = String(koreaTime.getMonth() + 1).padStart(2, '0');
    const day = String(koreaTime.getDate()).padStart(2, '0');
    const hours = String(koreaTime.getHours()).padStart(2, '0');
    const minutes = String(koreaTime.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// 근무 시간 계산
function calculateWorkHours(checkIn, checkOut) {
    if (!checkIn || !checkOut) return '-';
    
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    const diffMs = checkOutTime - checkInTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}시간 ${diffMinutes}분`;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    const fetchBtn = document.getElementById('fetch-btn');
    const tbody = document.getElementById('attendance-tbody');
    
    // 버튼 클릭 이벤트 연결 (수동 요청)
    fetchBtn.addEventListener('click', fetchAttendanceData);
    
    // 로그인 상태 초기 표시 (확인 중)
    updateLoginStatus();
    
    // 페이지 로드 시 자동 로그인 시도 (토큰이 없거나 만료되었을 수 있음)
    if (getAutoLogin()) {
        console.log('자동 로그인 활성화됨. 자동 로그인 시도 중...');
        const statusElement = document.getElementById('login-status');
        if (statusElement) {
            statusElement.className = 'login-status checking';
            statusElement.textContent = '로그인 확인 중...';
        }
        await tryAutoLogin();
    }
    
    // 먼저 저장된 데이터가 있으면 표시
    const savedData = loadAttendanceData();
    if (savedData) {
        console.log('저장된 데이터를 먼저 표시합니다.');
        displayAttendanceData(savedData);
    }
    
    // 자동 요청 확인 및 실행
    if (shouldAutoFetch()) {
        console.log('페이지 로드 시 자동으로 데이터를 가져옵니다.');
        fetchAttendanceData(true); // 자동 요청임을 표시
    } else {
        // 오늘 이미 요청했으면 상태 표시
        updateAutoStatus('not-needed');
        
        // 저장된 데이터가 없으면 메시지 표시
        if (!savedData) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-message">
                        오늘은 이미 데이터를 가져왔습니다.<br>
                        <small style="color: #9ca3af; font-size: 0.9rem;">수동으로 다시 가져오려면 버튼을 클릭하세요.</small>
                    </td>
                </tr>
            `;
        }
    }
    
    // 자동 출퇴근 시스템 초기화
    initAutoAttendance();
});

// ==================== 자동 출퇴근 시스템 ====================

// 서울 시간 기준 ISO 문자열 생성 (UTC+9)
function getSeoulISOString(date = new Date()) {
    const seoulTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const year = seoulTime.getFullYear();
    const month = String(seoulTime.getMonth() + 1).padStart(2, '0');
    const day = String(seoulTime.getDate()).padStart(2, '0');
    const hours = String(seoulTime.getHours()).padStart(2, '0');
    const minutes = String(seoulTime.getMinutes()).padStart(2, '0');
    const seconds = String(seoulTime.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+09:00`;
}

// 8시 25분으로 설정된 서울 시간 생성
function getSeoulTimeAt825() {
    const now = new Date();
    const seoulTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    seoulTime.setHours(8, 25, 0, 0);
    return seoulTime;
}

// user_info 테이블에서 내부 ID 조회
async function getUserInfoId() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/user_info?select=id&user_id=eq.${USER_ID}`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_API_KEY,
                'Authorization': getAuthToken(),
                'Accept': 'application/json',
                'Accept-Profile': 'public',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.length > 0) {
            return data[0].id; // 내부 ID (INT)
        }
        throw new Error('user_info를 찾을 수 없습니다.');
    } catch (error) {
        console.error('user_info 조회 오류:', error);
        throw error;
    }
}

// 오늘 출근 기록 확인
async function checkTodayRecord(userInfoId) {
    try {
        const today = getTodayDateString();
        const startOfDay = `${today}T00:00:00+09:00`;
        const endOfDay = `${today}T23:59:59+09:00`;

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/work_histories?user_id=eq.${userInfoId}&check_in=gte.${startOfDay}&check_in=lt.${endOfDay}&select=id`,
            {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_API_KEY,
                    'Authorization': getAuthToken(),
                    'Accept': 'application/json',
                    'Accept-Profile': 'public',
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data && data.length > 0;
    } catch (error) {
        console.error('오늘 기록 확인 오류:', error);
        return false;
    }
}

// 자동 출근 INSERT
async function autoCheckIn() {
    try {
        console.log('=== 자동 출근 시작 ===');
        
        // 1. user_info에서 내부 ID 조회
        const userInfoId = await getUserInfoId();
        console.log('userInfoId:', userInfoId);

        // 2. 오늘 출근 기록 확인
        const hasTodayRecord = await checkTodayRecord(userInfoId);
        if (hasTodayRecord) {
            console.log('오늘은 이미 출근 기록이 있습니다.');
            return;
        }

        // 3. 주말 확인
        const today = getTodayDateString();
        if (isWeekend(today)) {
            console.log('오늘은 주말입니다. 자동 출근을 건너뜁니다.');
            return;
        }

        // 4. 연차 확인
        const vacationDates = getVacationDates();
        if (vacationDates.includes(today)) {
            console.log('오늘은 연차입니다. 자동 출근을 건너뜁니다.');
            return;
        }

        // 5. 서울 시간 8시 25분으로 설정
        const seoulTime = getSeoulTimeAt825();
        const checkInTime = getSeoulISOString(seoulTime);

        // 6. work_histories에 INSERT
        const insertData = {
            user_id: userInfoId,
            check_in: checkInTime,
            check_out: null,
            check_in_location: FIXED_CHECK_IN_LOCATION,
            check_in_address: FIXED_CHECK_IN_ADDRESS,
            check_in_ip: FIXED_CHECK_IN_IP,
            check_out_location: null,
            check_out_address: null,
            check_out_ip: null,
            created_at: checkInTime,
            updated_at: checkInTime
        };

        const response = await fetch(`${SUPABASE_URL}/rest/v1/work_histories`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_API_KEY,
                'Authorization': getAuthToken(),
                'Accept': 'application/json',
                'Accept-Profile': 'public',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(insertData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            
            // 401 에러 시 토큰 자동 갱신 시도
            if (response.status === 401) {
                try {
                    await refreshAuthToken();
                    console.log('토큰이 자동으로 갱신되었습니다. 자동 출근을 재시도합니다.');
                    // 재시도
                    const retryResponse = await fetch(`${SUPABASE_URL}/rest/v1/work_histories`, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_API_KEY,
                            'Authorization': getAuthToken(),
                            'Accept': 'application/json',
                            'Accept-Profile': 'public',
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify(insertData)
                    });
                    
                    if (!retryResponse.ok) {
                        const retryErrorText = await retryResponse.text();
                        throw new Error(`HTTP error! status: ${retryResponse.status}, message: ${retryErrorText}`);
                    }
                    
                    const result = await retryResponse.json();
                    console.log('자동 출근 성공 (재시도):', result);
                    saveAutoCheckInDate(today);
                    setTimeout(() => {
                        fetchAttendanceData();
                    }, 1000);
                    return true;
                } catch (refreshError) {
                    console.error('토큰 자동 갱신 실패:', refreshError);
                    // 갱신 실패 시 자동 로그인 시도
                    const autoLoginSuccess = await tryAutoLogin();
                    if (autoLoginSuccess) {
                        console.log('자동 로그인 성공. 자동 출근을 재시도합니다.');
                        // 재시도
                        const retryResponse = await fetch(`${SUPABASE_URL}/rest/v1/work_histories`, {
                            method: 'POST',
                            headers: {
                                'apikey': SUPABASE_API_KEY,
                                'Authorization': getAuthToken(),
                                'Accept': 'application/json',
                                'Accept-Profile': 'public',
                                'Content-Type': 'application/json',
                                'Prefer': 'return=representation'
                            },
                            body: JSON.stringify(insertData)
                        });
                        
                        if (!retryResponse.ok) {
                            const retryErrorText = await retryResponse.text();
                            throw new Error(`HTTP error! status: ${retryResponse.status}, message: ${retryErrorText}`);
                        }
                        
                        const result = await retryResponse.json();
                        console.log('자동 출근 성공 (재시도):', result);
                        saveAutoCheckInDate(today);
                        setTimeout(() => {
                            fetchAttendanceData();
                        }, 1000);
                        return true;
                    }
                    throw new Error(`인증 토큰이 만료되었습니다. 로그인해주세요. (HTTP ${response.status})`);
                }
            }
            
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('자동 출근 성공:', result);
        
        // 자동 출근 완료 날짜 저장 (위에서 선언한 today 변수 재사용)
        saveAutoCheckInDate(today);
        
        // 데이터 새로고침
        setTimeout(() => {
            fetchAttendanceData();
        }, 1000);
        
        return true;
    } catch (error) {
        console.error('자동 출근 오류:', error);
        return false;
    }
}

// 자동 출근 날짜 관리
function getAutoCheckInDates() {
    try {
        const saved = localStorage.getItem(AUTO_CHECKIN_DATES_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('자동 출근 날짜 불러오기 오류:', error);
        return [];
    }
}

function saveAutoCheckInDate(date) {
    try {
        const dates = getAutoCheckInDates();
        if (!dates.includes(date)) {
            dates.push(date);
            dates.sort();
            localStorage.setItem(AUTO_CHECKIN_DATES_KEY, JSON.stringify(dates));
            console.log('자동 출근 날짜 저장:', date);
        }
    } catch (error) {
        console.error('자동 출근 날짜 저장 오류:', error);
    }
}

function isAutoCheckInDate(date) {
    const dates = getAutoCheckInDates();
    return dates.includes(date);
}

// 자동 출퇴근 활성화/비활성화
function setAutoAttendanceEnabled(enabled) {
    localStorage.setItem(AUTO_ATTENDANCE_KEY, enabled ? 'true' : 'false');
    updateAutoAttendanceUI();
    
    if (enabled) {
        console.log('자동 출퇴근이 활성화되었습니다.');
        checkAndAutoCheckIn();
        // 매 분마다 체크 (8시 25분 확인)
        if (!window.autoCheckInInterval) {
            window.autoCheckInInterval = setInterval(() => {
                checkAndAutoCheckIn();
            }, 60000); // 1분마다 체크
        }
    } else {
        console.log('자동 출퇴근이 비활성화되었습니다.');
        if (window.autoCheckInInterval) {
            clearInterval(window.autoCheckInInterval);
            window.autoCheckInInterval = null;
        }
    }
}

// 자동 출퇴근 활성화 여부 확인
function isAutoAttendanceEnabled() {
    return localStorage.getItem(AUTO_ATTENDANCE_KEY) === 'true';
}

// 자동 출퇴근 UI 업데이트
function updateAutoAttendanceUI() {
    const enabled = isAutoAttendanceEnabled();
    const enableBtn = document.getElementById('enable-auto-btn');
    const disableBtn = document.getElementById('disable-auto-btn');
    const statusInfo = document.getElementById('auto-status-info');
    
    if (enabled) {
        enableBtn.style.display = 'none';
        disableBtn.style.display = 'inline-block';
        statusInfo.textContent = '자동 출퇴근이 활성화되어 있습니다. 매일 8시 25분에 자동으로 출근 처리됩니다.';
        statusInfo.style.color = '#059669';
    } else {
        enableBtn.style.display = 'inline-block';
        disableBtn.style.display = 'none';
        statusInfo.textContent = '자동 출퇴근이 비활성화되어 있습니다.';
        statusInfo.style.color = '#6b7280';
    }
}

// 데이터에서 오늘 기록 확인 후 자동 출근
async function checkTodayAndAutoCheckIn(data) {
    if (!isAutoAttendanceEnabled()) {
        return;
    }

    const today = getTodayDateString();
    
    // 주말 확인
    if (isWeekend(today)) {
        console.log('오늘은 주말입니다. 자동 출근을 건너뜁니다.');
        return;
    }
    
    const records = Array.isArray(data) ? data : [];
    
    // 오늘 날짜의 기록이 있는지 확인
    const hasTodayRecord = records.some(record => {
        const recordDate = record.check_in || record.created_at;
        if (!recordDate) return false;
        const recordDateStr = recordDate.split('T')[0];
        return recordDateStr === today;
    });

    if (!hasTodayRecord) {
        // 연차 확인
        const vacationDates = getVacationDates();
        if (!vacationDates.includes(today)) {
            console.log('오늘 출근 기록이 없습니다. 자동 출근을 실행합니다.');
            const success = await autoCheckIn();
            if (success) {
                localStorage.setItem('last_auto_checkin_date', today);
            }
        } else {
            console.log('오늘은 연차입니다. 자동 출근을 건너뜁니다.');
        }
    }
}

// 자동 출근 체크 및 실행 (8시 25분 체크)
async function checkAndAutoCheckIn() {
    if (!isAutoAttendanceEnabled()) {
        return;
    }

    const today = getTodayDateString();
    
    // 주말 확인
    if (isWeekend(today)) {
        return;
    }

    const now = new Date();
    const seoulTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const hours = seoulTime.getHours();
    const minutes = seoulTime.getMinutes();

    // 8시 25분 ~ 8시 26분 사이에만 실행
    if (hours === 8 && minutes >= 25 && minutes < 26) {
        // 오늘 이미 실행했는지 확인
        const lastAutoCheckIn = localStorage.getItem('last_auto_checkin_date');
        
        if (lastAutoCheckIn !== today) {
            console.log('자동 출근 실행 시도...');
            const success = await autoCheckIn();
            if (success) {
                localStorage.setItem('last_auto_checkin_date', today);
            }
        }
    }
}

// 연차 날짜 관리 (JSON 파일 기반)
let vacationDatesCache = null;

// JSON 파일에서 연차 날짜 읽기 (localStorage 우선 사용, 파일은 업로드 시에만 사용)
async function loadVacationDatesFromFile() {
    try {
        // localStorage에서 불러오기
        const saved = localStorage.getItem(VACATION_DATES_KEY);
        if (saved) {
            try {
                vacationDatesCache = JSON.parse(saved);
                if (Array.isArray(vacationDatesCache)) {
                    console.log('연차 날짜를 localStorage에서 불러왔습니다:', vacationDatesCache);
                    return vacationDatesCache;
                }
            } catch (parseError) {
                console.error('localStorage 데이터 파싱 오류:', parseError);
                // 파싱 오류 시 빈 배열로 초기화
                vacationDatesCache = [];
                localStorage.setItem(VACATION_DATES_KEY, JSON.stringify(vacationDatesCache));
                return vacationDatesCache;
            }
        }
        
        // localStorage에 없으면 빈 배열로 초기화
        vacationDatesCache = [];
        localStorage.setItem(VACATION_DATES_KEY, JSON.stringify(vacationDatesCache));
        console.log('연차 날짜를 빈 배열로 초기화했습니다.');
        return vacationDatesCache;
    } catch (error) {
        console.error('연차 날짜 불러오기 오류:', error);
        // 모든 방법 실패 시 빈 배열 반환
        vacationDatesCache = [];
        try {
            localStorage.setItem(VACATION_DATES_KEY, JSON.stringify(vacationDatesCache));
        } catch (e) {
            console.error('localStorage 저장 오류:', e);
        }
        return [];
    }
}

// JSON 파일에 연차 날짜 저장 (다운로드 방식)
function saveVacationDatesToFile(dates) {
    try {
        const jsonData = JSON.stringify(dates, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vacation-dates.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // localStorage에도 저장 (캐시)
        localStorage.setItem(VACATION_DATES_KEY, JSON.stringify(dates));
        vacationDatesCache = dates;
        console.log('연차 날짜를 JSON 파일로 저장했습니다:', dates);
    } catch (error) {
        console.error('JSON 파일 저장 오류:', error);
    }
}

// 연차 날짜 가져오기 (캐시 우선)
function getVacationDates() {
    if (vacationDatesCache !== null) {
        return vacationDatesCache;
    }
    // 캐시가 없으면 localStorage에서 불러오기
    try {
        const saved = localStorage.getItem(VACATION_DATES_KEY);
        if (saved) {
            vacationDatesCache = JSON.parse(saved);
            return vacationDatesCache;
        }
    } catch (error) {
        console.error('연차 날짜 불러오기 오류:', error);
    }
    return [];
}

// 연차 날짜 저장
function saveVacationDates(dates) {
    vacationDatesCache = dates;
    // JSON 파일로 저장
    saveVacationDatesToFile(dates);
}

function addVacationDate(date) {
    const dates = getVacationDates();
    if (!dates.includes(date)) {
        dates.push(date);
        dates.sort();
        saveVacationDates(dates);
        renderVacationList();
        return true;
    }
    return false;
}

function removeVacationDate(date) {
    const dates = getVacationDates();
    const filtered = dates.filter(d => d !== date);
    saveVacationDates(filtered);
    renderVacationList();
}

function renderVacationList() {
    const list = document.getElementById('vacation-list');
    const dates = getVacationDates();
    
    if (dates.length === 0) {
        list.innerHTML = '<li style="color: #9ca3af; font-style: italic;">등록된 연차가 없습니다.</li>';
        return;
    }
    
    list.innerHTML = dates.map(date => {
        const dateObj = new Date(date + 'T00:00:00');
        const formatted = formatDate(date);
        return `
            <li>
                <span class="vacation-date">${formatted}</span>
                <button class="remove-vacation" data-date="${date}">삭제</button>
            </li>
        `;
    }).join('');
    
    // 삭제 버튼 이벤트
    list.querySelectorAll('.remove-vacation').forEach(btn => {
        btn.addEventListener('click', () => {
            const date = btn.getAttribute('data-date');
            removeVacationDate(date);
        });
    });
}

// 토큰 만료 모달 표시
function showTokenExpiredModal() {
    const tokenModal = document.getElementById('token-modal');
    tokenModal.classList.add('show');
}

// 자동 출퇴근 시스템 초기화
async function initAutoAttendance() {
    // JSON 파일에서 연차 날짜 로드
    await loadVacationDatesFromFile();
    
    // UI 업데이트
    updateAutoAttendanceUI();
    
    // 토큰 설정 모달
    const tokenModal = document.getElementById('token-modal');
    const tokenSettingsBtn = document.getElementById('token-settings-btn');
    const closeTokenModal = document.getElementById('close-token-modal');
    const saveTokenBtn = document.getElementById('save-token-btn');
    const autoExtractTokenBtn = document.getElementById('auto-extract-token-btn');
    const tokenInput = document.getElementById('token-input');
    const loginBtn = document.getElementById('login-btn');
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const autoLoginCheckbox = document.getElementById('auto-login-checkbox');
    
    // 저장된 로그인 정보로 필드 채우기 (없으면 기본값)
    const savedInfo = getSavedLoginInfo();
    loginEmail.value = savedInfo.email;
    loginPassword.value = savedInfo.password;
    
    // 로그인 정보가 저장되어 있지 않으면 기본값으로 저장
    if (!localStorage.getItem(SAVED_EMAIL_KEY)) {
        saveLoginInfo(DEFAULT_EMAIL, DEFAULT_PASSWORD);
    }
    
    // 자동 로그인 체크박스 상태 복원 (기본값 true)
    autoLoginCheckbox.checked = getAutoLogin();
    
    // 자동 로그인이 활성화되어 있으면 기본값으로 설정
    if (autoLoginCheckbox.checked && !localStorage.getItem(AUTO_LOGIN_KEY)) {
        setAutoLogin(true);
    }
    
    // 자동 로그인 체크박스 이벤트
    autoLoginCheckbox.addEventListener('change', (e) => {
        setAutoLogin(e.target.checked);
        if (e.target.checked) {
            // 체크하면 현재 입력된 정보 저장
            saveLoginInfo(loginEmail.value.trim() || savedInfo.email, loginPassword.value.trim() || savedInfo.password);
        }
    });
    
    // 로그인 버튼 이벤트
    loginBtn.addEventListener('click', async () => {
        const email = loginEmail.value.trim() || savedInfo.email;
        const password = loginPassword.value.trim() || savedInfo.password;
        
        if (!email || !password) {
            alert('이메일과 비밀번호를 입력해주세요.');
            return;
        }
        
        loginBtn.disabled = true;
        loginBtn.textContent = '로그인 중...';
        
        try {
            await loginWithEmail(email, password);
            
            // 자동 로그인이 활성화되어 있으면 정보 저장
            if (autoLoginCheckbox.checked) {
                saveLoginInfo(email, password);
                setAutoLogin(true);
            }
            
            loginBtn.textContent = '✓ 로그인 성공!';
            loginBtn.style.background = '#10b981';
            
            // 모달 닫기
            setTimeout(() => {
                tokenModal.classList.remove('show');
                loginBtn.textContent = '로그인';
                loginBtn.style.background = '#10b981';
                loginBtn.disabled = false;
                
                // 자동 로그인이 활성화되어 있으면 비밀번호 필드 유지
                if (!autoLoginCheckbox.checked) {
                    loginPassword.value = '';
                }
                
                // 데이터 다시 가져오기
                fetchAttendanceData();
            }, 1000);
        } catch (error) {
            console.error('로그인 오류:', error);
            loginBtn.textContent = '✗ 로그인 실패';
            loginBtn.style.background = '#ef4444';
            alert('로그인에 실패했습니다.\n\n' + error.message);
            updateLoginStatus(); // 로그인 상태 업데이트
            
            setTimeout(() => {
                loginBtn.textContent = '로그인';
                loginBtn.style.background = '#10b981';
                loginBtn.disabled = false;
            }, 2000);
        }
    });
    
    tokenSettingsBtn.addEventListener('click', () => {
        tokenModal.classList.add('show');
        // 현재 토큰 표시 (Bearer 제거)
        const currentToken = getAuthToken();
        tokenInput.value = currentToken.replace(/^Bearer\s+/, '');
    });
    
    closeTokenModal.addEventListener('click', () => {
        tokenModal.classList.remove('show');
    });
    
    tokenModal.addEventListener('click', (e) => {
        if (e.target === tokenModal) {
            tokenModal.classList.remove('show');
        }
    });
    
    // 자동 토큰 추출 버튼
    autoExtractTokenBtn.addEventListener('click', async () => {
        autoExtractTokenBtn.disabled = true;
        autoExtractTokenBtn.textContent = '추출 중...';
        
        try {
            // 현재 활성 탭 가져오기
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab || !tab.id) {
                throw new Error('활성 탭을 찾을 수 없습니다.');
            }
            
            // Content Script에 토큰 추출 요청
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractToken' });
            
            if (response && response.success && response.token) {
                // 토큰을 입력 필드에 자동 입력
                tokenInput.value = response.token;
                autoExtractTokenBtn.textContent = '✓ 추출 완료!';
                autoExtractTokenBtn.style.background = '#10b981';
                
                // 2초 후 원래대로
                setTimeout(() => {
                    autoExtractTokenBtn.textContent = '🔍 현재 페이지에서 자동 추출';
                    autoExtractTokenBtn.style.background = '#3b82f6';
                    autoExtractTokenBtn.disabled = false;
                }, 2000);
            } else {
                throw new Error('토큰을 찾을 수 없습니다. Supabase 대시보드나 ERP 시스템 페이지에서 시도해주세요.');
            }
        } catch (error) {
            console.error('토큰 추출 오류:', error);
            autoExtractTokenBtn.textContent = '✗ 추출 실패';
            autoExtractTokenBtn.style.background = '#ef4444';
            
            alert('토큰을 자동으로 추출할 수 없습니다.\n\n' + 
                  '다음 방법을 시도해주세요:\n' +
                  '1. Supabase 대시보드나 ERP 시스템 페이지를 열어주세요\n' +
                  '2. 브라우저 개발자 도구(F12) → Network 탭 → 요청 헤더에서 Authorization 값을 복사하세요\n' +
                  '3. 또는 수동으로 토큰을 입력해주세요');
            
            setTimeout(() => {
                autoExtractTokenBtn.textContent = '🔍 현재 페이지에서 자동 추출';
                autoExtractTokenBtn.style.background = '#3b82f6';
                autoExtractTokenBtn.disabled = false;
            }, 3000);
        }
    });
    
    saveTokenBtn.addEventListener('click', () => {
        const token = tokenInput.value.trim();
        if (token) {
            setAuthToken(token);
            updateLoginStatus(); // 로그인 상태 업데이트
            tokenModal.classList.remove('show');
            alert('토큰이 저장되었습니다. 다시 시도해주세요.');
            // 데이터 다시 가져오기
            setTimeout(() => {
                fetchAttendanceData();
            }, 500);
        } else {
            alert('토큰을 입력해주세요.');
        }
    });
    
    // 버튼 이벤트
    document.getElementById('enable-auto-btn').addEventListener('click', () => {
        setAutoAttendanceEnabled(true);
    });
    
    document.getElementById('disable-auto-btn').addEventListener('click', () => {
        setAutoAttendanceEnabled(false);
    });
    
    // 연차 모달
    const vacationModal = document.getElementById('vacation-modal');
    const vacationBtn = document.getElementById('vacation-btn');
    const closeModal = document.getElementById('close-vacation-modal');
    const addVacationBtn = document.getElementById('add-vacation-btn');
    const vacationDateInput = document.getElementById('vacation-date-input');
    
    vacationBtn.addEventListener('click', async () => {
        vacationModal.classList.add('show');
        // 모달 열 때 최신 데이터 로드
        await loadVacationDatesFromFile();
        renderVacationList();
    });
    
    closeModal.addEventListener('click', () => {
        vacationModal.classList.remove('show');
    });
    
    vacationModal.addEventListener('click', (e) => {
        if (e.target === vacationModal) {
            vacationModal.classList.remove('show');
        }
    });
    
    addVacationBtn.addEventListener('click', () => {
        const date = vacationDateInput.value;
        if (date) {
            if (addVacationDate(date)) {
                vacationDateInput.value = '';
                alert('연차가 추가되었습니다. JSON 파일이 다운로드됩니다.');
            } else {
                alert('이미 등록된 날짜입니다.');
            }
        }
    });
    
    // JSON 파일 업로드
    const uploadJsonInput = document.getElementById('upload-json');
    uploadJsonInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (Array.isArray(data)) {
                    vacationDatesCache = data;
                    saveVacationDates(data);
                    renderVacationList();
                    alert('JSON 파일이 업로드되었습니다.');
                } else {
                    alert('올바른 JSON 형식이 아닙니다.');
                }
            } catch (error) {
                console.error('JSON 파일 읽기 오류:', error);
                alert('JSON 파일을 읽을 수 없습니다.');
            }
            e.target.value = ''; // 파일 입력 초기화
        }
    });
    
    // JSON 파일 다운로드
    const downloadJsonBtn = document.getElementById('download-json-btn');
    downloadJsonBtn.addEventListener('click', () => {
        const dates = getVacationDates();
        saveVacationDatesToFile(dates);
    });
    
    // 활성화되어 있으면 체크 시작
    if (isAutoAttendanceEnabled()) {
        checkAndAutoCheckIn();
        window.autoCheckInInterval = setInterval(() => {
            checkAndAutoCheckIn();
        }, 60000);
    }
    
    // 탭 전환 기능
    initTabs();
    
    // 결재 시스템 초기화
    initRequestsSystem();
}

// ==================== 탭 기능 ====================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // 모든 탭 버튼과 콘텐츠 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 선택한 탭 활성화
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
            
            // 결재 시스템 탭이 활성화되면 자동으로 데이터 가져오기
            if (targetTab === 'requests') {
                fetchWorkRequests();
            }
        });
    });
}

// ==================== 결재 시스템 ====================

let requestsRefreshInterval = null;
let lastRequestsData = null;
let allRequestsData = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 20;

// work_requests 데이터 가져오기
async function fetchWorkRequests() {
    const tbody = document.getElementById('requests-tbody');
    const fetchBtn = document.getElementById('fetch-requests-btn');
    const statusSpan = document.getElementById('requests-status');
    
    // 로딩 상태 표시
    fetchBtn.disabled = true;
    fetchBtn.classList.add('loading');
    const originalBtnContent = fetchBtn.innerHTML;
    fetchBtn.innerHTML = '<span class="refresh-icon">🔄</span> 데이터 불러오는 중...';
    statusSpan.textContent = '데이터 불러오는 중...';
    statusSpan.className = 'auto-status loading';
    
    // 기존 데이터가 있으면 유지하고, 없으면 로딩 메시지 표시
    const existingRows = tbody.querySelectorAll('tr');
    if (existingRows.length === 0 || existingRows[0].classList.contains('loading-message')) {
        tbody.innerHTML = `
            <tr class="loading-row">
                <td colspan="8" class="loading-message">데이터를 불러오는 중...</td>
            </tr>
        `;
    }
    
    // 로딩 오버레이 추가 (깜빡임 방지)
    let loadingOverlay = document.getElementById('requests-loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'requests-loading-overlay';
        loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); display: flex; align-items: center; justify-content: center; z-index: 10; pointer-events: none; opacity: 0; transition: opacity 0.3s;';
        const tableContainer = tbody.closest('.table-container');
        if (tableContainer) {
            tableContainer.style.position = 'relative';
            tableContainer.appendChild(loadingOverlay);
        }
    }
    loadingOverlay.style.opacity = '1';
    
    try {
        const apiUrl = `${SUPABASE_URL}/rest/v1/work_requests?select=*&order=created_at.desc`;
        
        console.log('=== 결재 문서 API 요청 ===');
        console.log('URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_API_KEY,
                'Authorization': getAuthToken(),
                'Accept': 'application/json',
                'Accept-Profile': 'public',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('=== API 오류 응답 ===');
            console.error('Error Text:', errorText);
            
            if (response.status === 401) {
                // 먼저 refresh token으로 자동 갱신 시도
                try {
                    await refreshAuthToken();
                    // 토큰 갱신 성공하면 재시도
                    console.log('토큰이 자동으로 갱신되었습니다. 재시도합니다.');
                    return fetchWorkRequests();
                } catch (refreshError) {
                    console.log('토큰 자동 갱신 실패:', refreshError);
                    // 갱신 실패 시 자동 로그인 시도
                    const autoLoginSuccess = await tryAutoLogin();
                    if (autoLoginSuccess) {
                        console.log('자동 로그인 성공. 재시도합니다.');
                        return fetchWorkRequests();
                    }
                    
                    // 자동 로그인도 실패하면 모달 표시
                    try {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.message && errorJson.message.includes('JWT expired')) {
                            setTimeout(() => {
                                showTokenExpiredModal();
                            }, 100);
                            throw new Error('인증 토큰이 만료되었습니다. 로그인하거나 새 토큰을 입력해주세요.');
                        }
                    } catch (parseError) {
                        setTimeout(() => {
                            showTokenExpiredModal();
                        }, 100);
                        throw new Error('인증 토큰이 만료되었거나 유효하지 않습니다. 로그인하거나 새 토큰을 입력해주세요.');
                    }
                }
            }
            
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        
        console.log('=== 받아온 결재 문서 데이터 ===');
        console.log('데이터 타입:', Array.isArray(data) ? 'Array' : typeof data);
        console.log('데이터 개수:', Array.isArray(data) ? data.length : 'N/A');
        console.log('전체 데이터:', JSON.stringify(data, null, 2));
        
        if (Array.isArray(data) && data.length > 0) {
            console.log('=== 첫 번째 레코드 구조 분석 ===');
            console.log('첫 번째 레코드:', data[0]);
            console.log('컬럼 목록:', Object.keys(data[0]));
        }
        
        // 전체 데이터 저장
        allRequestsData = Array.isArray(data) ? data : [];
        currentPage = 1; // 새 데이터 로드 시 첫 페이지로
        
        displayWorkRequests();
        
        // 마지막 새로고침 시간 업데이트
        updateLastRefreshTime('requests-last-refresh-time');
        
        // 성공 상태 표시
        const now = new Date();
        const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        statusSpan.textContent = `✓ 최종 업데이트: ${timeStr}`;
        statusSpan.className = 'auto-status completed';
        
        // 새 데이터가 있는지 확인
        if (lastRequestsData) {
            const newCount = allRequestsData.length - lastRequestsData.length;
            if (newCount > 0) {
                statusSpan.textContent = `✓ 새 문서 ${newCount}개 발견! (${timeStr})`;
            }
        }
        lastRequestsData = allRequestsData;
        
    } catch (error) {
        console.error('결재 문서를 가져오는 중 오류 발생:', error);
        const thead = document.getElementById('requests-thead');
        thead.innerHTML = '';
        
        let errorMessage = error.message;
        let isTokenError = false;
        
        if (error.message.includes('JWT expired') || error.message.includes('인증 토큰') || error.message.includes('401')) {
            errorMessage = '인증 토큰이 만료되었습니다. 🔑 버튼을 클릭하여 토큰을 업데이트해주세요.';
            isTokenError = true;
            // 토큰 모달 표시
            setTimeout(() => {
                showTokenExpiredModal();
            }, 100);
        }
        
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">
                    데이터를 불러올 수 없습니다.<br>
                    <small style="color: ${isTokenError ? '#ef4444' : '#9ca3af'}; font-size: 0.9rem;">${errorMessage}</small>
                    ${isTokenError ? '<br><small style="color: #6b7280; font-size: 0.85rem;">상단의 🔑 버튼을 클릭하여 새 토큰을 입력하세요.</small>' : ''}
                </td>
            </tr>
        `;
        
        statusSpan.textContent = `✗ 오류: ${errorMessage}`;
        statusSpan.className = 'auto-status error';
    } finally {
        // 로딩 오버레이 제거
        const loadingOverlay = document.getElementById('requests-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                if (loadingOverlay.parentNode) {
                    loadingOverlay.parentNode.removeChild(loadingOverlay);
                }
            }, 300);
        }
        
        // 버튼 상태 복원
        fetchBtn.disabled = false;
        fetchBtn.classList.remove('loading');
        fetchBtn.innerHTML = originalBtnContent || '<span class="refresh-icon">🔄</span> 결재 문서 가져오기';
    }
}

// work_requests 데이터를 테이블에 표시 (페이징 처리)
function displayWorkRequests() {
    const thead = document.getElementById('requests-thead');
    const tbody = document.getElementById('requests-tbody');
    
    if (!allRequestsData || allRequestsData.length === 0) {
        thead.innerHTML = '';
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-message">결재 문서가 없습니다.</td>
            </tr>
        `;
        updatePaginationUI(0);
        return;
    }

    // 페이징 계산
    const totalItems = allRequestsData.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    const currentPageData = allRequestsData.slice(startIndex, endIndex);
    
    // 표시할 컬럼 정의 (순번, 이름, 부서, 문서유형, 상태, 사유, 결재자, 신청일)
    const displayColumns = [
        { key: 'sequence', label: '순번' },
        { key: 'name', label: '이름' },
        { key: 'department', label: '부서' },
        { key: 'type', label: '문서유형' },
        { key: 'status', label: '상태' },
        { key: 'reason', label: '사유' },
        { key: 'approver', label: '결재자' },
        { key: 'created_at', label: '신청일' }
    ];
    
    // 테이블 헤더 생성
    thead.innerHTML = displayColumns.map(col => `<th>${col.label}</th>`).join('');
    
    // 테이블 바디 생성
    tbody.innerHTML = currentPageData.map((record, index) => {
        const globalIndex = startIndex + index;
        const sequence = totalItems - globalIndex; // 역순 순번
        
        // 컬럼 값 매핑 함수
        const getColumnValue = (colKey) => {
            switch(colKey) {
                case 'sequence':
                    return sequence;
                case 'name':
                    // user_info에서 이름 가져오기 또는 user_name 등
                    return record.user_name || record.name || record.user_id || '-';
                case 'department':
                    return record.department || record.dept || '-';
                case 'type':
                    // type 매핑: vacation -> 휴가, expense -> 여비, business -> 출장
                    const typeMap = {
                        'vacation': '휴가',
                        'expense': '여비',
                        'business': '출장'
                    };
                    return typeMap[record.type] || record.type || '-';
                case 'status':
                    // status 매핑: rejected -> 반려, completed -> 완료, pending -> 대기
                    const statusMap = {
                        'rejected': '반려',
                        'completed': '완료',
                        'pending': '대기'
                    };
                    return statusMap[record.status] || record.status || '-';
                case 'reason':
                    return record.reason || record.description || record.content || '-';
                case 'approver':
                    return record.approver || record.approver_name || record.approved_by || '-';
                case 'created_at':
                    // yy/mm/dd hh:mm 형식으로 포맷팅
                    if (record.created_at) {
                        return formatCreatedAt(record.created_at);
                    }
                    return '-';
                default:
                    return record[colKey] || '-';
            }
        };
        
        return `
            <tr>
                ${displayColumns.map(col => {
                    const value = getColumnValue(col.key);
                    return `<td>${value !== null && value !== undefined ? value : '-'}</td>`;
                }).join('')}
            </tr>
        `;
    }).join('');
    
    // 페이징 UI 업데이트
    updatePaginationUI(totalItems, totalPages);
}

// 페이징 UI 업데이트
function updatePaginationUI(totalItems, totalPages = 0) {
    const infoText = document.getElementById('pagination-info-text');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const pageNumbers = document.getElementById('page-numbers');
    
    // 정보 텍스트 업데이트
    if (totalItems > 0) {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
        const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
        infoText.textContent = `전체 ${totalItems}개 (${startIndex}-${endIndex} 표시)`;
    } else {
        infoText.textContent = '전체 0개';
    }
    
    // 이전/다음 버튼 상태
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
    
    // 페이지 번호 표시
    if (totalPages === 0) {
        pageNumbers.innerHTML = '';
        return;
    }
    
    // 최대 10개 페이지 번호만 표시
    let startPage = Math.max(1, currentPage - 4);
    let endPage = Math.min(totalPages, startPage + 9);
    
    if (endPage - startPage < 9) {
        startPage = Math.max(1, endPage - 9);
    }
    
    pageNumbers.innerHTML = '';
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            displayWorkRequests();
        });
        pageNumbers.appendChild(pageBtn);
    }
}

// 페이지 변경
function goToPage(page) {
    const totalPages = Math.ceil(allRequestsData.length / ITEMS_PER_PAGE);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        displayWorkRequests();
    }
}

// 자동 새로고침 설정
function setAutoRefresh(enabled) {
    if (enabled) {
        // 3분마다 새로고침 (180000ms)
        if (!requestsRefreshInterval) {
            requestsRefreshInterval = setInterval(() => {
                console.log('자동 새로고침 실행...');
                fetchWorkRequests();
            }, 180000); // 3분
        }
        console.log('자동 새로고침이 활성화되었습니다. (3분마다)');
    } else {
        if (requestsRefreshInterval) {
            clearInterval(requestsRefreshInterval);
            requestsRefreshInterval = null;
        }
        console.log('자동 새로고침이 비활성화되었습니다.');
    }
}

// 결재 시스템 초기화
function initRequestsSystem() {
    const fetchBtn = document.getElementById('fetch-requests-btn');
    const autoRefreshCheckbox = document.getElementById('auto-refresh-checkbox');
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    // 자동 새로고침 체크박스 기본값을 true로 설정
    autoRefreshCheckbox.checked = true;
    setAutoRefresh(true); // 기본값으로 자동 새로고침 활성화
    
    // 수동 가져오기 버튼
    fetchBtn.addEventListener('click', fetchWorkRequests);
    
    // 자동 새로고침 체크박스
    autoRefreshCheckbox.addEventListener('change', (e) => {
        setAutoRefresh(e.target.checked);
        if (e.target.checked) {
            // 체크 시 즉시 한 번 실행
            fetchWorkRequests();
        }
    });
    
    // 페이징 버튼
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allRequestsData.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        }
    });
}


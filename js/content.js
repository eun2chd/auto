// Content Script - 현재 페이지에서 Supabase 토큰 자동 추출

// Supabase 토큰을 찾는 함수
function findSupabaseToken() {
    let token = null;
    
    // 1. localStorage에서 Supabase 토큰 찾기
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.includes('supabase') || key.includes('auth') || key.includes('token'))) {
                const value = localStorage.getItem(key);
                try {
                    const parsed = JSON.parse(value);
                    if (parsed && parsed.access_token) {
                        token = parsed.access_token;
                        break;
                    }
                    // 다른 형식의 토큰 저장
                    if (typeof parsed === 'string' && parsed.startsWith('eyJ')) {
                        token = parsed;
                        break;
                    }
                } catch (e) {
                    // JSON이 아닌 경우 문자열로 확인
                    if (value && value.startsWith('eyJ')) {
                        token = value;
                        break;
                    }
                }
            }
        }
    } catch (e) {
        console.error('localStorage 접근 오류:', e);
    }
    
    // 2. sessionStorage에서 찾기
    if (!token) {
        try {
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && (key.includes('supabase') || key.includes('auth') || key.includes('token'))) {
                    const value = sessionStorage.getItem(key);
                    try {
                        const parsed = JSON.parse(value);
                        if (parsed && parsed.access_token) {
                            token = parsed.access_token;
                            break;
                        }
                    } catch (e) {
                        if (value && value.startsWith('eyJ')) {
                            token = value;
                            break;
                        }
                    }
                }
            }
        } catch (e) {
            console.error('sessionStorage 접근 오류:', e);
        }
    }
    
    // 3. 쿠키에서 찾기
    if (!token) {
        try {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [key, value] = cookie.trim().split('=');
                if (key && (key.includes('supabase') || key.includes('auth') || key.includes('token'))) {
                    if (value && value.startsWith('eyJ')) {
                        token = decodeURIComponent(value);
                        break;
                    }
                }
            }
        } catch (e) {
            console.error('쿠키 접근 오류:', e);
        }
    }
    
    return token;
}

// 메시지 리스너 - 토큰 추출 요청 처리
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractToken') {
        const token = findSupabaseToken();
        sendResponse({ success: !!token, token: token });
        return true; // 비동기 응답
    }
    return false;
});


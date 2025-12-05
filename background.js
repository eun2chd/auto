// Service Worker for ERP 자동 출퇴근 시스템

// 확장 프로그램 설치 시
chrome.runtime.onInstalled.addListener(() => {
  console.log('ERP 자동 출퇴근 시스템이 설치되었습니다.');
});

// 확장 프로그램 아이콘 클릭 시 (popup이 열릴 때)
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});

// 알림 권한 요청 (필요한 경우)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkAutoAttendance') {
    // 자동 출퇴근 체크 로직은 popup에서 처리됩니다.
    sendResponse({ success: true });
  }
  return true; // 비동기 응답을 위해 true 반환
});

// 주기적으로 자동 출퇴근 체크 (alarms API 사용)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkAutoAttendance') {
    // 팝업이 열려있을 때만 실행하도록 체크
    // 실제 자동 출근 로직은 popup의 app.js에서 처리됩니다.
    console.log('자동 출퇴근 체크 시간입니다.');
  }
});

// 매일 8시 25분에 알람 설정
function setupDailyAlarm() {
  const now = new Date();
  const seoulTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  
  // 오늘 8시 25분
  const checkTime = new Date(seoulTime);
  checkTime.setHours(8, 25, 0, 0);
  
  // 이미 지났으면 내일로 설정
  if (checkTime < seoulTime) {
    checkTime.setDate(checkTime.getDate() + 1);
  }
  
  chrome.alarms.create('checkAutoAttendance', {
    when: checkTime.getTime()
  });
  
  console.log('자동 출퇴근 알람이 설정되었습니다:', checkTime);
}

// 설치 시 알람 설정
chrome.runtime.onInstalled.addListener(() => {
  setupDailyAlarm();
});

// 브라우저 시작 시 알람 재설정
chrome.runtime.onStartup.addListener(() => {
  setupDailyAlarm();
});


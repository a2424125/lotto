import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root")!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 서비스 워커 등록 방지 (업데이트 알림 제거)
// serviceWorker.register(); <- 이런 코드가 있다면 주석 처리하거나 제거
// serviceWorkerRegistration.register(); <- 이런 코드도 제거

// 만약 기존에 등록된 서비스 워커가 있다면 제거
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
      console.log("서비스 워커가 제거되었습니다.");
    }
  });
}

// ポップアップを開いたときに、前回選択したSNSのチェック状態を復元
window.onload = async () => {
  const data = await chrome.storage.local.get(['share_x', 'share_threads', 'share_bsky']);
  if (data.share_x !== undefined) document.getElementById('chk_x').checked = data.share_x;
  if (data.share_threads !== undefined) document.getElementById('chk_threads').checked = data.share_threads;
  if (data.share_bsky !== undefined) document.getElementById('chk_bsky').checked = data.share_bsky;
};

document.getElementById('btn_share').onclick = async () => {
  const shareX = document.getElementById('chk_x').checked;
  const shareThreads = document.getElementById('chk_threads').checked;
  const shareBsky = document.getElementById('chk_bsky').checked;

  // 次回のためにチェック状態を保存
  await chrome.storage.local.set({
    'share_x': shareX,
    'share_threads': shareThreads,
    'share_bsky': shareBsky
  });

  // 現在のタブ情報を取得
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab) {
    // Background（Service Worker）へメッセージを送信してポップアップを閉じる
    chrome.runtime.sendMessage({
      action: "share",
      tab: tab,
      targets: { x: shareX, threads: shareThreads, bsky: shareBsky }
    });
    window.close();
  }
};
// 共通のURLクレンジング処理
function cleanUrl(rawUrl) {
  let url = rawUrl.replace(/https:\/\/www\.nikkei\.com\/paper\/article\/\?.*\=/, 'https://www.nikkei.com/article/');
  if (!url.match("youtube.com")) {
    url = url.replace(/\?.*$/, '');
  }
  return url;
}

// ポップアップからの命令を待ち受ける
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "share") {
    executeCrosspost(message.tab, message.targets);
  }
});

async function executeCrosspost(tab, targets) {
  const data = await chrome.storage.local.get(['Prefix', 'position']);
  const prefix = data.Prefix || 'NowBrowsing: ';
  const position = data.position || '1';
  const url_url = cleanUrl(tab.url);

  // 1つのテキストにまとめる用（Threads, Bluesky用）
  const combinedText = prefix + tab.title + " " + url_url;

  // 各SNSのターゲットURLを配列で管理
  const urlsToOpen = [];
  if (targets.x) {
    urlsToOpen.push('https://twitter.com/intent/tweet?text=' + encodeURIComponent(prefix + tab.title) + '&url=' + encodeURIComponent(url_url));
  }
  if (targets.threads) {
    urlsToOpen.push('https://www.threads.net/intent/post?text=' + encodeURIComponent(combinedText));
  }
  if (targets.bsky) {
    urlsToOpen.push('https://bsky.app/intent/compose?text=' + encodeURIComponent(combinedText));
  }

  if (urlsToOpen.length === 0) return;

  // 画面位置の計算ベース（前回の動的取得ベース）
  const currentWin = await chrome.windows.getLastFocused();
  const screenW = currentWin.width || 1920;
  const screenH = currentWin.height || 1080;
  const screenLeft = currentWin.left || 0;
  const screenTop = currentWin.top || 0;

  let left = screenLeft, top = screenTop, width = 640, height = screenH;

  switch (position) {
    case "1": width = screenW / 2; left = screenLeft + (screenW / 2); break;
    case "2": width = screenW / 2; left = screenLeft; break;
    case "3": width = screenW / 3; left = screenLeft + (screenW / 3 * 2); break;
    case "4": width = screenW / 3; left = screenLeft + (screenW / 3); break;
    case "5": width = screenW / 3; left = screenLeft; break;
    case "6": width = screenW / 4; left = screenLeft + (screenW / 4 * 3); break;
    case "7": width = screenW / 4; left = screenLeft + (screenW / 4 * 2); break;
    case "8": width = screenW / 4; left = screenLeft + (screenW / 4); break;
    case "9": width = screenW / 4; left = screenLeft; break;
    case "0":
      width = 640; height = 360;
      left = screenLeft + Math.round((screenW - width) / 2);
      top = screenTop + Math.round((screenH - height) / 2);
      break;
  }

  // Blueskyなどのレイアウト崩れを防ぐため、1/4分割などで幅が狭すぎる場合は550pxを確保
  if (width < 450) {
    width = 550;
    if (left > screenLeft) {
      left = screenLeft + screenW - width;
    }
  }

  // 選択されたSNSの分だけポップアップウィンドウを開く
  // 完全に同じ位置に重なると不便なため、複数ある場合は少しずつ下にずらして配置します
  urlsToOpen.forEach((url, index) => {
    chrome.windows.create({
      url: url,
      type: 'popup',
      left: Math.round(left),
      top: Math.round(top + (index * 40)), // 2窓目以降は40pxずつ縦にずらす
      width: Math.round(width),
      height: Math.round(height - (index * 40))
    });
  });
}
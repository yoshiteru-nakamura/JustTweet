async function onClicked(tab) {
  // chrome.storage.local から設定を取得
  const data = await chrome.storage.local.get(['Prefix', 'position']);
  const prefix = data.Prefix || 'NowBrowsing: ';
  const position = data.position || '1';

  let url_url = tab.url;

  // nikkei.com customize
  url_url = url_url.replace(/https:\/\/www\.nikkei\.com\/paper\/article\/\?.*\=/, 'https://www.nikkei.com/article/');

  // UTM remove
  if (!url_url.match("youtube.com")) {
    url_url = url_url.replace(/\?.*$/, '');
  }

  const tweetUrl = 'https://twitter.com/intent/tweet?'
    + 'text=' + encodeURIComponent(prefix) + encodeURIComponent(tab.title)
    + '&url=' + encodeURIComponent(url_url);

  // 画面情報の取得 (MV3のService Workerではchrome.system.display等が必要だが、
  // 簡易的に現在のウィンドウ情報を基準にするか、既定値を使用)
  // ここではchrome.windows.getCurrentを使用して現在の画面情報を推測するか、
  // あるいは固定値/最大化を利用します。
  
  const currentWin = await chrome.windows.getCurrent();
  const screenW = 1920; // 標準的なフルHDを想定（動的に取得する場合は追加の実装が必要）
  const screenH = 1080;

  let left = 0, top = 0, width = 640, height = screenH;

  switch (position) {
    case "1": // Right half
      width = screenW / 2; left = screenW / 2; break;
    case "2": // Left half
      width = screenW / 2; left = 0; break;
    case "3": // 1/3 Right
      width = screenW / 3; left = (screenW / 3) * 2; break;
    case "4": // 1/3 Centre
      width = screenW / 3; left = screenW / 3; break;
    case "5": // 1/3 Left
      width = screenW / 3; left = 0; break;
    case "6": // 1/4 Right
      width = screenW / 4; left = (screenW / 4) * 3; break;
    case "7": // 2/4 Right-ish
      width = screenW / 4; left = (screenW / 4) * 2; break;
    case "8": // 2/4 Left-ish
      width = screenW / 4; left = screenW / 4; break;
    case "9": // 1/4 Left
      width = screenW / 4; left = 0; break;
    case "0": // Centre
      width = 640; height = 360;
      left = Math.round((screenW - width) / 2);
      top = Math.round((screenH - height) / 2);
      break;
  }

  chrome.windows.create({
    url: tweetUrl,
    type: 'popup',
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(width),
    height: Math.round(height)
  });
}

chrome.action.onClicked.addListener(onClicked);
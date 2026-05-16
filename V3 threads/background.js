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

  // Threads用にテキストとURLを1つの文章として結合してエンコードする
  const shareText = prefix + tab.title + " " + url_url;
  const threadsUrl = 'https://www.threads.net/intent/post?'
    + 'text=' + encodeURIComponent(shareText);

  // 画面情報の取得
  const currentWin = await chrome.windows.getCurrent();
  const screenW = 1920; 
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
    url: threadsUrl,
    type: 'popup',
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(width),
    height: Math.round(height)
  });
}

chrome.action.onClicked.addListener(onClicked);
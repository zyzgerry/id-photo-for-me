const current = document.documentElement.dataset.release;
const zh = navigator.language.toLowerCase().startsWith('zh');
function showReload(message) {
  const notice = document.createElement('div');
  notice.className = 'error'; notice.setAttribute('role','alert');
  const explanation = document.createElement('p'); explanation.textContent = message;
  const reload = document.createElement('button'); reload.className = 'button primary';
  reload.textContent = zh ? '重新加载' : 'Reload'; reload.onclick = () => location.reload();
  notice.append(explanation,reload); document.body.replaceChildren(notice);
  document.body.inert = false; reload.focus();
}
let latest = current;
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 3000);
try {
  const response = await fetch(`./release.json?check=${Date.now()}`, {cache:'no-store', signal:controller.signal});
  if (response.ok) {
    const {version} = await response.json();
    if (typeof version === 'string' && /^[a-f0-9]{16}$/.test(version)) latest = version;
  }
} catch {
  // A failed update check must not prevent using the current release.
} finally {
  clearTimeout(timeout);
}
if (latest !== current) {
  const url = new URL(location.href);
  url.searchParams.set('release', latest);
  if (url.href !== location.href) location.replace(url.href);
  else showReload(zh ? '更新仍在发布中，请稍后重试。' : 'The update is still being published. Please try again shortly.');
} else {
  try {
    await import(`./assets/${current}/src/app.js`);
    document.body.inert = false;
  } catch {
    showReload(zh ? '无法加载编辑工具。请检查网络连接后重新加载。' : 'The editor could not load. Check your connection and reload.');
  }
}

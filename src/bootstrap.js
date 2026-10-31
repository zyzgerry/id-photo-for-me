const current = document.documentElement.dataset.release;
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
  else {
    const error = document.getElementById('error');
    error.textContent = navigator.language.startsWith('zh') ? '更新仍在发布中，请稍后重试。' : 'The update is still being published. Please try again shortly.';
    error.hidden = false;
    document.body.inert = false;
  }
} else {
  await import(`./assets/${current}/src/app.js`);
  document.body.inert = false;
}

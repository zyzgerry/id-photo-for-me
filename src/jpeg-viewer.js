// Display the full-resolution image, independently of the page preview.
export function createJpegViewer(t) {
  const $=id=>document.getElementById(id);
  const dialog=$('jpeg-viewer'),viewport=$('viewer-viewport'),image=$('viewer-image');
  let opener=null,url=null,revision=0,width=0,height=0,bytes=0,zoom=1,fitted=true,ready=false;
  let title='inspectJpeg';
  const points=new Map();let gesture;
  const fitScale=()=>Math.min(1,viewport.clientWidth/width,viewport.clientHeight/height);
  const minimum=()=>Math.min(0.1,fitScale());
  function refresh(){
    $('viewer-in').ariaLabel=t('zoomIn');$('viewer-out').ariaLabel=t('zoomOut');
    const editing=title==='inspectEdit';
    $('viewer-title').textContent=viewport.ariaLabel=t(title);
    image.alt=t(editing?'editedPreview':'singlePreview');
    const dimensions=`${width}×${height} px`;
    $('viewer-meta').textContent=ready?(editing?dimensions:`${dimensions} · ${(bytes/1000).toFixed(1)} KB`):t(editing?'inspectEditLoading':'viewerLoading');
  }
  function setZoom(value,anchor){
    if(!ready) return;
    const x=anchor?.x??viewport.clientWidth/2,y=anchor?.y??viewport.clientHeight/2;
    const oldWidth=width*zoom,oldHeight=height*zoom;
    const imageX=(viewport.scrollLeft+x-Math.max(0,(viewport.clientWidth-oldWidth)/2))/zoom;
    const imageY=(viewport.scrollTop+y-Math.max(0,(viewport.clientHeight-oldHeight)/2))/zoom;
    zoom=Math.min(8,Math.max(minimum(),value));
    image.style.width=`${width*zoom}px`;image.style.height=`${height*zoom}px`;
    viewport.scrollLeft=imageX*zoom+Math.max(0,(viewport.clientWidth-width*zoom)/2)-x;
    viewport.scrollTop=imageY*zoom+Math.max(0,(viewport.clientHeight-height*zoom)/2)-y;
    $('viewer-zoom').textContent=`${Math.round(zoom*100)}%`;
    $('viewer-fit').setAttribute('aria-pressed',String(fitted));
    $('viewer-actual').setAttribute('aria-pressed',String(!fitted&&Math.abs(zoom-1)<0.0001));
    $('viewer-in').disabled=zoom>=8;$('viewer-out').disabled=zoom<=minimum();
  }
  function fit(){fitted=true;setZoom(fitScale());}
  function step(factor){fitted=false;setZoom(zoom*factor);}
  function clean(){
    revision++;ready=false;points.clear();gesture=null;
    image.removeAttribute('src');image.style.width=image.style.height='';
    if(url) URL.revokeObjectURL(url);url=null;
    if(opener?.isConnected)opener.focus({preventScroll:true});opener=null;
  }
  function close(){if(dialog.open) dialog.close();clean();}
  dialog.addEventListener('close',()=>{if(!dialog.open)clean();});
  $('viewer-close').onclick=close;
  $('viewer-fit').onclick=fit;
  $('viewer-actual').onclick=()=>{fitted=false;setZoom(1);};
  $('viewer-in').onclick=()=>step(1.25);$('viewer-out').onclick=()=>step(0.8);
  dialog.onkeydown=e=>{
    if(e.ctrlKey||e.metaKey||e.altKey) return;
    if(['+','=','-','0','1'].includes(e.key)) {
      e.preventDefault();
      if(e.key==='0')fit();else if(e.key==='1'){$('viewer-actual').click();}else step(e.key==='-'?0.8:1.25);
    }
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) {
      e.preventDefault();viewport.scrollBy({left:e.key==='ArrowLeft'?-60:e.key==='ArrowRight'?60:0,top:e.key==='ArrowUp'?-60:e.key==='ArrowDown'?60:0,behavior:'instant'});
    }
  };
  const distance=()=>{const p=[...points.values()];return p.length<2?0:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);};
  function start(){const p=[...points.values()][0];gesture=p?{...p,left:viewport.scrollLeft,top:viewport.scrollTop,distance:distance(),zoom}:null;}
  viewport.onpointerdown=e=>{if(!ready)return;viewport.setPointerCapture(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});start();};
  viewport.onpointermove=e=>{
    if(!points.has(e.pointerId)||!gesture) return;
    points.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(points.size>=2&&gesture.distance) {
      const p=[...points.values()],box=viewport.getBoundingClientRect();
      fitted=false;setZoom(gesture.zoom*distance()/gesture.distance,{x:(p[0].x+p[1].x)/2-box.left,y:(p[0].y+p[1].y)/2-box.top});
    } else {viewport.scrollLeft=gesture.left+gesture.x-e.clientX;viewport.scrollTop=gesture.top+gesture.y-e.clientY;}
  };
  for(const event of ['pointerup','pointercancel','lostpointercapture']) viewport.addEventListener(event,e=>{points.delete(e.pointerId);start();});
  viewport.ondblclick=()=>{if(fitted){fitted=false;setZoom(1);}else fit();};
  window.addEventListener('resize',()=>{if(dialog.open&&ready){if(fitted)fit();else setZoom(zoom);}});
  return {close,refresh,async open(blob,w,h,trigger,heading='inspectJpeg'){
    close();opener=trigger;const current=++revision;
    width=w;height=h;bytes=blob.size;fitted=true;title=heading;
    url=URL.createObjectURL(blob);image.src=url;
    viewport.setAttribute('aria-busy','true');refresh();dialog.showModal();
    try {
      await image.decode();if(current!==revision)return;
      ready=true;refresh();fit();
    } catch {if(current===revision) $('viewer-meta').textContent=t(title==='inspectEdit'?'inspectEditError':'exportError');}
    finally {if(current===revision)viewport.removeAttribute('aria-busy');}
  }};
}

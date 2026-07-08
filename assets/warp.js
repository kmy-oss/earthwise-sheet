/* 宇宙ワープ背景(共通): .hero-canvas すべてでリアルタイム描画。
   動画不要・自動再生制約なし。星が中心から手前へ流れる。
   画面外/非表示タブでは停止して省電力。 */
(function(){
  var COLORS=['#ffffff','#ffffff','#e6e8ec','#c2c6cc','#9aa0a8','#7a808a'];
  function rnd(a,b){return a+Math.random()*(b-a);}

  function init(cv){
    var ctx=cv.getContext('2d'); if(!ctx) return;
    var W,H,DPR,stars=[],raf=null,visible=true,prev=0,density;
    function resize(){
      DPR=Math.min(window.devicePixelRatio||1,2);
      W=cv.clientWidth; H=cv.clientHeight;
      cv.width=W*DPR; cv.height=H*DPR; ctx.setTransform(DPR,0,0,DPR,0,0);
      density=Math.min(9000, Math.round((W*H)/130));
    }
    function spawn(s){
      s.x=rnd(-W/2,W/2); s.y=rnd(-H/2,H/2); s.z=rnd(0.05,1);
      s.sz=Math.pow(rnd(0.18,1),1.8)*2.6+0.25;   /* サイズばらつき(小さい星が多め) */
      s.c=COLORS[(Math.random()*COLORS.length)|0];
    }
    function seed(){ stars=[]; for(var i=0;i<density;i++){ var s={}; spawn(s); stars.push(s); } }
    function frame(t){
      if(!visible){ raf=null; return; }
      var dt=prev?Math.min((t-prev)/16.7,3):1; prev=t;
      ctx.clearRect(0,0,W,H);
      var cx=W/2, cy=H/2;
      for(var i=0;i<stars.length;i++){
        var s=stars[i];
        s.z-=dt*0.006*(1.1-s.z);
        if(s.z<0.05){ spawn(s); s.z=1; }
        var k=1/s.z;
        var sx=cx+s.x*k, sy=cy+s.y*k;
        if(sx<0||sx>W||sy<0||sy>H) continue;
        var depth=1-s.z;
        var r=Math.max(0.3, depth*s.sz);
        ctx.globalAlpha=Math.min(1, 0.12+depth*0.88);
        ctx.beginPath(); ctx.arc(sx,sy,r,0,6.283); ctx.fillStyle=s.c; ctx.fill();
      }
      ctx.globalAlpha=1;
      raf=requestAnimationFrame(frame);
    }
    function start(){ if(!raf){ prev=0; raf=requestAnimationFrame(frame);} }
    function stop(){ if(raf){ cancelAnimationFrame(raf); raf=null;} }

    resize(); seed(); start();
    window.addEventListener('resize',function(){ resize(); seed(); });
    document.addEventListener('visibilitychange',function(){ visible=!document.hidden; if(visible) start(); else stop(); });
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){ visible=e.isIntersecting; if(visible) start(); else stop(); }); },{threshold:0}).observe(cv);
    }
  }

  function boot(){
    var list=document.querySelectorAll('.hero-canvas');
    for(var i=0;i<list.length;i++) init(list[i]);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();

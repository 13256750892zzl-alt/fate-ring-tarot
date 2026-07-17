import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const launcher=fs.readFileSync(new URL('./启动.bat',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'index.html 内联脚本不存在');
new Function(script);

function extractFunction(name){
  const start=script.indexOf(`function ${name}(`);
  assert.notEqual(start,-1,`缺少 ${name}`);
  const open=script.indexOf('{',start);
  let depth=0;
  for(let i=open;i<script.length;i++){
    if(script[i]==='{') depth++;
    if(script[i]==='}' && --depth===0) return script.slice(start,i+1);
  }
  throw new Error(`${name} 函数未闭合`);
}

const lmDist=new Function(`return (${extractFunction('lmDist')})`)();
const pinchRatio=new Function('lmDist',`return (${extractFunction('pinchRatio')})`)(lmDist);
const isPinchPose=new Function('lmDist','pinchRatio',`return (${extractFunction('isPinchPose')})`)(lmDist,pinchRatio);
const swipeDirection=new Function('SWIPE_WINDOW_MS','SWIPE_TRIGGER',`return (${extractFunction('swipeDirection')})`)(650,.055);

function hand(tips){
  const lm=Array.from({length:21},()=>({x:.5,y:.55}));
  lm[0]={x:.5,y:.9};
  lm[5]={x:.38,y:.62};
  lm[9]={x:.5,y:.6};
  lm[17]={x:.62,y:.62};
  [4,8,12,16,20].forEach((i,k)=>lm[i]=tips[k]);
  return lm;
}

assert.equal(isPinchPose(hand([
  {x:.48,y:.31},{x:.49,y:.29},{x:.5,y:.28},{x:.51,y:.29},{x:.52,y:.31}
])),true,'五指指尖聚拢应识别为捏合');

assert.equal(isPinchPose(hand([
  {x:.47,y:.30},{x:.49,y:.29},{x:.5,y:.14},{x:.64,y:.18},{x:.78,y:.30}
])),true,'拇指与食指捏合应立即识别');

assert.equal(isPinchPose(hand([
  {x:.2,y:.5},{x:.32,y:.22},{x:.46,y:.14},{x:.62,y:.18},{x:.8,y:.3}
])),false,'张开手掌不能误判为捏合');

assert.equal(isPinchPose(hand([
  {x:.47,y:.64},{x:.49,y:.62},{x:.5,y:.61},{x:.52,y:.62},{x:.54,y:.64}
])),false,'握拳不能误判为五指捏合');

assert.equal(swipeDirection(.08,300),1,'右挥应锁定持续右转');
assert.equal(swipeDirection(-.08,300),-1,'左挥应锁定持续左转');
assert.equal(swipeDirection(.02,300),0,'轻微抖动不能触发转动');
assert.equal(swipeDirection(.08,800),0,'缓慢漂移不能触发挥手');

assert.match(script,/const palmX=1-lm\[9\]\.x/,'必须按镜像后的屏幕方向追踪掌心');
assert.match(script,/const next=\(dir<0\?-1:1\)\*GESTURE_SPEED/,'左右移动必须映射为同方向固定速度');
assert.doesNotMatch(script,/GESTURE_STOP_MS|lastGestureMove/,'手停或离开画面后不能自动停止');
assert.match(script,/pinchHold>=2/,'短促捏合应快速选择卡片');
assert.match(script,/assets\/mediapipe\/vision_bundle\.mjs/,'MediaPipe 运行时必须从本地加载');
assert.match(script,/location\.protocol==='file:'/,'直接打开 index.html 时必须给出启动方式提示');
assert.match(script,/cam-state/,'摄像头必须提供可见状态反馈');
assert.match(launcher,/Start-Process 'http:\/\/localhost:8080\/'/,'启动脚本必须自动打开正确网址');

console.log('gesture checks passed');

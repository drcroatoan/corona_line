// CORONA LIVE by Croatoan
// corona-live.com 화면처럼 구성한 위젯입니다.
// 목적에 맞게 색상은 기본 칼라로만 변수 구성했습니다.
// (그래프 및 증감 색상 변경 직접 변경 필요)
// ver 1.3 - apiv3 변경, 총 확진자 수 & 총 증가 수 업데이트, UpOrDown kformat 변수 적용
// ver 1.2 - 확진자 수 증가로 인해 그래프 구분선을 5000대까지 확장
// ver 1.1 - 그래프 좌측 여백 적용, 10 이하 표시조건 추가
// 미리보기와 화면이 다름 (디자인시 참조)

const useBGimg = false; // 배경 이미지 사용 여부
const bgBookMark = "배경 북마크"; // 배경 북마크 이름
const bgColor = "#FFFFFF"; // 배경 색상

const m_font = "Helvetica Neue Bold"; // 기본 폰트(medium)
const normal_font = "Helvetica Neue";
const num_font = "Arial Rounded MT Bold";

//const baseColor = "58595B"; // 기본 색상(폰트 및 그래프)
const baseColor = "ffffff"; // 기본 색상(다크)

const title_fontsize = 12; // 제목 폰트 사이즈
const header_fontsize = 7; // '총'/ '실시간' 폰트 사이즈
const val_fontsize = 12; // 확진자 수 폰트 사이즈
const gap_fontsize = 10; // 증감 수 폰트 사이즈
const update_fontsize = 8; // 새로고침 폰트 사이즈
const gap_marksize = 6; // 증감 화살표 크기

const todayColor = "#5673EB"; // 오늘 그래프 색상
const yesterdayColor = "#999999"; // 어제 그래프 색상
const gradeitionColor = "#244DF5"; //그래프 그라데이션

const graphSize = 148; // ❗️그래프 크기 
const leftSpace = 0; // 그래프 좌측 여백

const border = 0;


// 데이터 처리

const fmi = FileManager.iCloud();

const stat_data = await new Request('https://apiv3.corona-live.com/domestic/stat.json').loadJSON();
const data = await new Request('https://apiv2.corona-live.com/domestic-init.json').loadJSON();

const ttlval = kFormatter(stat_data.overview.confirmed[0]);
const ttlgap = stat_data.overview.confirmed[1];

const today_timeval = data.timeseries.today;
const yesterday_timeval = data.timeseries.yesterday;

const nowval = data.statsLive.today;
const nowgap = data.statsLive.today - data.statsLive.yesterday;

const number_X = (Object.keys(today_timeval)).length - 1;

let today_Y = [], yesterday_Y = []
for (let i = 7; i < (7 + number_X + 1); i++) {
  today_Y.push(data.timeseries.today[i]);
  yesterday_Y.push(data.timeseries.yesterday[i]);
}

const max_today = today_Y[today_Y.length - 1];
const max_yesterday = yesterday_Y[yesterday_Y.length - 1];

const maxnow = max_today > max_yesterday ? max_today : max_yesterday;

const ratio_Y = maxnow < 5 ? 1 : maxnow < 50 ? 10 : maxnow < 250 ? 50 : maxnow < 500 ? 100 : maxnow < 1000 ? 200 : maxnow < 5000 ? 1000 : 2000;
const max_Y = parseInt(maxnow / ratio_Y + 1) * ratio_Y;

const unit_X = 500 / (number_X);
const unit_Y = 270 / (max_Y / ratio_Y);



// ------------ 레이아웃 시작 -------------\\

const g = new ListWidget();
g.setPadding(0, 5, 0, 5);
g.borderWidth = border;
let outbox, box, inbox, innerbox, header, value;

g.addSpacer();

let title = g.addText(`COVID-19`);
title.font = new Font(m_font, title_fontsize);
title.textColor = new Color(baseColor, 1);
title.centerAlignText();

g.addSpacer(6);

outbox = g.addStack();
outbox.borderWidth = border;
box = outbox.addStack();
box.borderWidth = border;
box.layoutVertically();
header = box.addText("총 확진자수");
header.font = new Font(m_font, header_fontsize);
header.textColor = new Color(baseColor, 0.6);

box.addSpacer(3);

inbox = box.addStack();
inbox.centerAlignContent();
inbox.borderWidth = border;
value = inbox.addText(`${ttlval.toLocaleString()}`);
value.font = new Font(num_font, val_fontsize);
value.textColor = new Color(baseColor, 1.0);
value.minimumScaleFactor = 0.9;//0.9

inbox.addSpacer(3);

UporDown(ttlgap, inbox, num_font, gap_fontsize, false);

outbox.addSpacer(); // 중간 공백처리

box = outbox.addStack();
box.borderWidth = border;
box.layoutVertically();
header = box.addText("실시간 확진자 수");
header.font = new Font(m_font, header_fontsize);
header.textColor = new Color(baseColor, 0.6);

box.addSpacer(2);

inbox = box.addStack();
inbox.centerAlignContent();
inbox.borderWidth = border;
value = inbox.addText(`${nowval.toLocaleString()}`);
//value = inbox.addText(`9,999`);
value.font = new Font(num_font, val_fontsize);
value.textColor = new Color(baseColor, 1.0);
value.minimumScaleFactor = 0.9; //0.9

inbox.addSpacer(3);

UporDown(nowgap, inbox, num_font, gap_fontsize, true);

g.addSpacer(6);

const graphstack = g.addStack();
graphstack.borderWidth = border;
graphstack.addSpacer(leftSpace);
let graph = graphstack.addImage(drawCoronaGraph());
graph.imageSize = new Size(graphSize, graphSize * 340 / 600);
graph.borderWidth = border;

g.addSpacer(4);

let updatetime = g.addText(`업데이트 ${new Date().toLocaleTimeString('fr', {hour: '2-digit', minute: '2-digit'})}`);
updatetime.font = new Font(normal_font, update_fontsize);
updatetime.textColor = new Color(baseColor, 0.8);
updatetime.centerAlignText();

g.addSpacer();

//if(useBGimg) {
//   g.backgroundImage = fmi.readImage(fmi.bookmarkedPath(bgBookMark));// 
// } else {
//   g.backgroundColor = new Color(bgColor);// 
// }

const { transparent } = importModule('no-background')
g.backgroundImage = await transparent(Script.name())

////transparent
//const nobg = importModule('no-background.js')
//var tint = '#000000'
//nobg.applyTint(g, tint, 1.0)

g.url = 'https://corona-live.com';

g.refreshAfterDate = new Date(Date.now() + 1000 * 180);

if (config.runsInWidget) {
  Script.setWidget(g);
} else {
  g.presentSmall();
}

Script.complete();



// ------------------- 함수 영역 -------------------\\
// 코로나 그래프 그리기

function drawCoronaGraph() {
  const drawContext = new DrawContext();
  drawContext.size = new Size(600, 340);
  drawContext.setTextAlignedCenter();
  drawContext.opaque = false;
  drawContext.respectScreenScale = false;
  for(let i = 0; i <= max_Y / ratio_Y ; i++) {
    drawLine(20, 290 - unit_Y * i, 550, 290 - unit_Y * i, 0.5, new Color(baseColor, 0.5));
    drawText(kFormatter(i * ratio_Y) , 23, 550, 278 - unit_Y * i, new Color(baseColor, 0.5));

  }
  drawLine(530, 20, 530, 290, 0.5, new Color(baseColor, 0.5));
  let start_Y, end_Y;
  let offset_J = 0;
  for(let i = 0; i < number_X + 1; i++) {
    if(i != number_X) {
      if((number_X > 9 && i % 2 == 0) || number_X <= 9) {
        drawTextC(7 + i, 26, 5 + unit_X * i, 305, 52, 26, new Color(baseColor, 0.5));
      }    
      start_Y = 290 - today_Y[i] * unit_Y / ratio_Y;
      end_Y = 290 - today_Y[i + 1] * unit_Y / ratio_Y;

      for(let j = offset_J; j < (start_Y - end_Y); j = j + 1) {      
        drawLine(30 + unit_X * (i) + j/(start_Y - end_Y) * unit_X, start_Y - j, 30 + unit_X * (number_X), start_Y - j, 0.3, new Color(gradeitionColor, 0.05 + 0.9 * ((290 - (start_Y - j)) / (max_today * unit_Y / ratio_Y))));
      }
      
      drawLine(30 + unit_X * i, 290 - yesterday_Y[i] * unit_Y / ratio_Y, 30 + unit_X * (i + 1), 290 - yesterday_Y[i + 1] * unit_Y / ratio_Y, 4, new Color(yesterdayColor, 0.5));
      drawLine(30 + unit_X * i, start_Y, 30 + unit_X * (i + 1), end_Y, 4, new Color(todayColor, 0.5));
    }
    drawCircle(22 + unit_X * i, 282 - yesterday_Y[i] * unit_Y / ratio_Y, 16, yesterdayColor, 1);
    drawCircle(22 + unit_X * i, 282 - today_Y[i] * unit_Y / ratio_Y, 16, todayColor, 1);
    offset_J = end_Y - parseInt(end_Y);
  }
  drawTextC(`현재`, 22, 520, 307, 52, 26, new Color(baseColor, 0.5));
  drawCircle(10 + unit_X * (number_X), 270 - today_Y[number_X] * unit_Y / ratio_Y, 40, todayColor, 0.2);
  function drawText(text, fontSize, x, y, color = grayColor){
    drawContext.setFont(new Font(m_font, fontSize));
    drawContext.setTextColor(color);
    drawContext.drawText(new String(text).toString(), new Point(x, y));
  }
  function drawTextC(text, fontSize, x, y, w, h, color = Color.black()){
    drawContext.setFont(new Font(m_font, fontSize));
    drawContext.setTextColor(color);
    drawContext.drawTextInRect(new String(text).toString(), new Rect(x, y, w, h));
  }
  function drawLine(x1, y1, x2, y2, width, color){
    const path = new Path();
    path.move(new Point(x1, y1));
    path.addLine(new Point(x2, y2));
    drawContext.addPath(path);
    drawContext.setStrokeColor(color);
    drawContext.setLineWidth(width);
    drawContext.strokePath();
  }
  function drawCircle(x, y, size, color, opacity){
    drawContext.setFillColor(new Color(color, opacity));
    drawContext.fillEllipse(new Rect(x, y, size, size));
  }
  return drawContext.getImage();
}

// 증감 표시 박스
function UporDown(value, stack, font, fontsize, kformat) {
  let textcolor, bgcolor, sf;
  if(value == 0) { 
    return null;
  } else if(value > 0) {
    textcolor = "#eb5374";
    //bgcolor = "#eb537415"
    bgcolor = "#ffffff99";
    sf = "arrow.up";
  } else {
    textcolor = "#5673eb";
    //bgcolor = "#5673eb15";
    bgcolor = "#ffffff99";
    sf = "arrow.down";
  }
  let roundbox = stack.addStack();
  roundbox.centerAlignContent();
  roundbox.backgroundColor = new Color(bgcolor, 1.0);
  roundbox.cornerRadius = 4;
  roundbox.setPadding(1, 2.5, 1, 2.5);
  

  let content = roundbox.addText(kformat ? kFormatter(Math.abs(value)).toLocaleString() : Math.abs(value).toLocaleString());
  content.font = new Font(font, fontsize);
  content.textColor = new Color(textcolor);
  
//   roundbox.addSpacer(1)
  
  let mark = roundbox.addImage(SFSymbol.named(sf).image);
  mark.imageSize = new Size(gap_marksize, gap_marksize);
  mark.tintColor = new Color(textcolor);
}

// k함수
function kFormatter(num) {
    return Math.abs(num) > 999999 ? Math.sign(num)*((Math.abs(num)/1000000).toFixed(0)) + 'M' : Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(0)) + 'K' : Math.sign(num)*Math.abs(num)
}

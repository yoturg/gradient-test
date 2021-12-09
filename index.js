function getLinearGradient(ctx, { value, x = 0, y = 0, width, height }) {
  let args;
  let posParts = null;
  let pos = null;
  let start = 0;
  let sX;
  let sY;
  let eX;
  let eY;
  let matchedColor;
  let colorIndex;
  const parenColors = [];

  // 获得linear-gradient里面关于颜色的值
  args = /\((.*)\)/.exec(value)[1];
  // console.log("args", args);
  matchedColor = /((hsl|hsla|rgb|rgba)\(.*?\))/.exec(args);
  while (matchedColor) {
    colorIndex = parenColors.push(matchedColor[1]) - 1;
    args = `${args.substring(0, matchedColor.index)}###${colorIndex}###${args.substring(matchedColor.index + matchedColor[1].length, args.length)}`;
    matchedColor = /((hsl|hsla|rgb|rgba)\(.*?\))/.exec(args);
  }
  args = args.split(",");

  // 获得表示方向
  // drawLing(ctx, { sX: x, sY: y, eX: x + width, eY: y + height });
  // console.log("Math.atan2(width, height)", rad2deg(Math.atan2(width, height)));
  // console.log("Math.atan2(height, width)", rad2deg(Math.atan2(height, width)));
  posParts = args[0].trim().split(/\s+/);
  if (posParts[0] === "to") {
    if (posParts.length === 2 && ~posParts.indexOf("top")) {
      pos = "0deg";
    } else if (posParts.length === 2 && ~posParts.indexOf("right")) {
      pos = "90deg";
    } else if (posParts.length === 2 && ~posParts.indexOf("bottom")) {
      pos = "180deg";
    } else if (posParts.length === 2 && ~posParts.indexOf("left")) {
      pos = "270deg";
    } else if (posParts.length === 3 && ~posParts.indexOf("top") && ~posParts.indexOf("right")) {
      pos = `${Math.atan2(height, width)}rad`;
    } else if (posParts.length === 3 && ~posParts.indexOf("bottom") && ~posParts.indexOf("right")) {
      pos = `${Math.atan2(width, height) + Math.PI / 2}rad`;
    } else if (posParts.length === 3 && ~posParts.indexOf("bottom") && ~posParts.indexOf("left")) {
      pos = `${Math.atan2(width, height) + Math.PI / 2 + Math.atan2(height, width) * 2}rad`;
    } else if (posParts.length === 3 && ~posParts.indexOf("top") && ~posParts.indexOf("left")) {
      pos = `${2 * Math.PI - Math.atan2(height, width)}rad`;
    } else {
      start = -1;
    }
  } else if (unit2rad(posParts[0]) !== undefined) {
    // 如果第一个参数是方向
    pos = posParts[0];
  } else if (!isColor(posParts[0]) && !/###\d+###/.test(posParts[0])) {
    start = -1;
  }

  // 没有设置方向时的默认值
  if (!pos) {
    pos = "180deg";
  } else {
    start = 1;
  }
  // console.log("pos", rad2deg(parseFloat(pos)));
  // console.log('pos', pos)
  // console.log("start", start);

  // 基于定位和宽高，获取起点终点的坐标
  if (unit2rad(pos) !== undefined) {
    let alpha;
    let cornerX;
    let cornerY;
    const pi = Math.PI;
    let centerX = x + width / 2;
    let centerY = y + height / 2;

    // 把角度改成弧度
    alpha = unit2rad(pos);
    alpha = alpha < 0 ? alpha + 2 * pi : alpha;

    const a = alpha;
    // 往右上
    if (alpha >= 0 && alpha < pi / 2) {
      cornerX = x + width;
      cornerY = y;
    } else if (alpha >= pi / 2 && alpha < pi) {
      // 往右下
      cornerX = x + width;
      cornerY = y + height;
    } else if (alpha >= pi && alpha < pi * 1.5) {
      // 往左下
      cornerX = x;
      cornerY = y + height;
    } else if (alpha >= pi * 1.5 && alpha < pi * 2) {
      // 往左上
      cornerX = x;
      cornerY = y;
    }
    
    // 把角度转化为0～89，也就是0～.5pi
    alpha %= pi / 2;

    // 对角和中心两个点为长边形成的三角形的tan值
    const beta = Math.atan2(Math.abs(centerY - cornerY), Math.abs(cornerX - centerX));

    // 对角到中心的长度
    const cornerDistance = Math.sqrt(Math.pow(centerY - cornerY, 2) + Math.pow(centerX - cornerX, 2));
    
    // 计算起点和终点
    if (a >= 0 && a < pi / 2) {
      // 往右上
      // 终点到中心的连线长度
      const endDistance = cornerDistance * Math.sin(beta + alpha);
      eX = centerX + endDistance * Math.sin(alpha);
      eY = centerY - endDistance * Math.cos(alpha);
    } else if (a >= pi / 2 && a < pi) {
      // 往右下
      const endDistance = cornerDistance * Math.cos(beta - alpha);
      eX = centerX + endDistance * Math.cos(alpha);
      eY = centerY + endDistance * Math.sin(alpha);
    } else if (a >= pi && a < pi * 1.5) {
      // 左下
      const endDistance = cornerDistance * Math.sin(beta + alpha);
      eX = centerX - endDistance * Math.sin(alpha);
      eY = centerY + endDistance * Math.cos(alpha);
    } else if (a >= pi * 1.5 && a < pi * 2) {
      // 左上
      const endDistance = cornerDistance * Math.cos(beta - alpha);
      eX = centerX - endDistance * Math.cos(alpha);
      eY = centerY - endDistance * Math.sin(alpha);
    }
    sX = centerX * 2 - eX;
    sY = centerY * 2 - eY;

  } else {
    start === -1;
  }

  if (start === -1) {
    return ctx.createLinearGradient(0, 0, 0, 0);
  }
  
  // console.log('sX', sX)
  // console.log('sY', sY)
  // console.log('eX', eX)
  // console.log('eY', eY)
  // drawLing(ctx, { sX, sY, eX, eY });

  // 创建渐变对象
  const gradient = ctx.createLinearGradient(sX, sY, eX, eY);

  // 设置色标
  const colorStops = getColorStops(args.slice(start), parenColors, sX, sY, eX, eY);
  // 在渐变对象上添加色标
  for (let s = 0; s < colorStops.length; s++) {
    gradient.addColorStop(colorStops[s].pos / 100, colorStops[s].color);
  }

  

  // 返回渐变对象
  return gradient;
}

function getColorStops(stops, parenColors, sX, sY, eX, eY) {
  // console.log(arguments);
  const l = stops.length;

  const colorStops = [];
  const lastPoin = {};

  // console.log("stops", stops);
  for (let i = 0; i < l; i++) {
    let colorPos;
    let color;
    let colorStop = `${stops[i]}`.trim();
    if (~colorStop.indexOf(" ")) {
      // 处理有带位置的颜色
      [color, colorPos] = colorStop.split(/\s+/);

      // 处理百分比
      if (~colorStop.indexOf("px")) {
        colorPos = (parseFloat(colorPos) / Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2))) * 100;
      } else {
        colorPos = parseFloat(colorPos);
      }
    } else {
      // 处理没有带位置的颜色
      color = colorStop;
      if (i === 0) {
        colorPos = 0;
        lastPoin.pos = 0;
        lastPoin.index = i;
      } else if (i === l - 1) {
        colorPos = 100;
      }
    }

    // 处理颜色
    if (~color.indexOf("###")) {
      color = parenColors[/###(\d+)###/.exec(color)[1]];
    }

    // 当遇到一个有带位置的颜色的时候，把前面没有带位置的颜色的位置处理一下
    if (colorPos !== undefined) {
      if (i - lastPoin.index > 1) {
        const startIndex = lastPoin.index + 1;
        const startPos = lastPoin.pos;
        const offset = colorStops.length - startIndex;
        const step = (colorPos - startPos) / (offset + 1);

        for (let x = startIndex; x < colorStops.length; x++) {
          colorStops[x].pos = (x - startIndex + 1) * step + startPos;
        }
      }
      lastPoin.pos = colorPos;
      lastPoin.index = i;
    }

    colorStops.push({
      pos: colorPos,
      color,
    });
  }
  return colorStops;
}

function unit2rad(source) {
  const units = { deg: 360, grad: 400, rad: 2 * Math.PI, turn: 1 };
  const [num, unit] = source.split(/(?<=[0-9])(?=[a-zA-Z])/);
  if (!Number.isNaN(parseFloat(num)) && units[unit]) {
    // if
    return ((parseFloat(num) % units[unit]) * Math.PI) / (units[unit] / 2);
  } else {
    return undefined;
  }
}

function deg2rad(deg) {
  return ((parseFloat(deg) % 360) * Math.PI) / 180;
}

function rad2deg(rad) {
  return (rad * 180) / Math.PI;
}

function grad2rad(grad) {
  return ((parseFloat(grad) % 400) * Math.PI) / 200;
}

function isColor(strColor) {
  var s = new Option().style;
  s.color = strColor;
  // console.log("strColor", strColor);
  // console.log("s.color", s.color);
  return !!s.color;
}

function drawLing(ctx, { sX, sY, eX, eY }) {
  ctx.strokeStyle = "red";
  // 设置线条的宽度
  ctx.lineWidth = 2;
  ctx.beginPath();
  // 起点
  ctx.moveTo(sX, sY);
  // 终点
  ctx.lineTo(eX, eY);
  ctx.closePath();
  ctx.stroke();
}

function drawArc(ctx, { x, y }) {
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.fillStyle = "#000";
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
}

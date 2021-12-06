function getLinearGradient(ctx, { value, x = 0, y = 0, width, height }) {
  let args;
  let posParts = null;
  let pos = null;
  let start = 0;
  let sX;
  let sY;
  let eX;
  let eY;
  const positions = ["top", "bottom", "left", "right"];
  const units = ["deg", "grad", "rad", "turn"];
  const unitReg = new RegExp(`^(-?\\d+)(${units.join("|")})$`);
  console.log(unitReg);
  let matchedColor;
  let colorIndex;
  const parenColors = [];

  // 获得linear-gradient里面关于颜色的值
  args = /\((.*)\)/.exec(value)[1];
  matchedColor = /((hsl|hsla|rgb|rgba)\(.*?\))/.exec(args);
  while (matchedColor) {
    colorIndex = parenColors.push(matchedColor[1]) - 1;
    args = `${args.substring(0, matchedColor.index)}###${colorIndex}###${args.substring(matchedColor.index + matchedColor[1].length, args.length)}`;
    matchedColor = /((hsl|hsla|rgb|rgba)\(.*?\))/.exec(args);
  }
  args = args.split(",");

  // 获得表示方向
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
      pos = "45deg";
    } else if (posParts.length === 3 && ~posParts.indexOf("bottom") && ~posParts.indexOf("right")) {
      pos = "135deg";
    } else if (posParts.length === 3 && ~posParts.indexOf("bottom") && ~posParts.indexOf("left")) {
      pos = "225deg";
    } else if (posParts.length === 3 && ~posParts.indexOf("top") && ~posParts.indexOf("left")) {
      pos = "315deg";
    } else {
      start = -1;
    }
  } else if (unit2rad(posParts[0]) !== undefined) {
    // 如果第一个参数是方向
    pos = posParts[0];
  } else {
    start = -1;
  }

  if (start === -1) {
    return ctx.createLinearGradient();
  }

  // 没有设置方向时的默认值
  if (!pos) {
    pos = "top";
  } else {
    start = 1;
  }

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
      eY = centerX + endDistance * Math.cos(alpha);
    } else if (a >= pi * 1.5 && a < pi * 2) {
      // 左上
      const endDistance = cornerDistance * Math.cos(beta - alpha);
      eX = centerX - endDistance * Math.cos(alpha);
      eY = centerY - endDistance * Math.sin(alpha);
    }
    sX = centerX * 2 - eX;
    sY = centerY * 2 - eY;

    drawLing(ctx, { sX, sY, eX, eY });
    console.log(arguments);
    console.log("posParts", posParts);
    console.log("args", args);
    console.log("pos", pos);
    console.log(`sX=${sX}, sY=${sY}, eX=${eX}, eY=${eY}`);
    console.log("args", args);
    console.log("start", start);
    console.log("parenColor", parenColors);
    console.log(`corner (${cornerX}, ${cornerY})`);
    console.log(`center (${centerX}, ${centerY})`);
    drawArc(ctx, { x: centerX, y: centerY });
    drawArc(ctx, { x: cornerX, y: cornerY });
    console.log("beta", beta);
    console.log("beta-deg", rad2deg(beta));
    console.log("alpha", alpha);
    console.log("alpha-deg", rad2deg(alpha));
    // 起点和终点坐标
  }

  // 创建渐变对象
  const gradient = ctx.createLinearGradient(sX, sY, eX, eY);

  // 设置色标
  const colorStops = getColorStops(args.slice(start), parenColors, sX, sY, eX, eY);
  console.log("colorSrops", colorStops);
  // 在渐变对象上添加色标
  for (let s = 0; s < colorStops.length; s++) {
    gradient.addColorStop(colorStops[s].pos / 100, colorStops[s].color);
  }

  // 返回渐变对象
  return gradient;
}

function getColorStops(stops, parenColors, sX, sY, eX, eY) {
  let i;
  const l = stops.length;
  let colorStop;
  let stopParts;
  let color;
  let colorPos;
  const colorStops = [];

  for (i = 0; i < l; i++) {
    colorStop = stops[i].trim();

    if (colorPos >= 100) {
      break;
    }

    if (~colorStop.indexOf(" ")) {
      stopParts = colorStop.split(" ");
      color = stopParts[0];
      colorPos = stopParts[1];

      if (~colorPos.indexOf("px")) {
        colorPos = (parseFloat(colorPos) / Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2))) * 100;
      } else {
        colorPos = parseFloat(colorPos);
      }
    } else {
      color = colorStop;

      if (colorPos === undefined) {
        colorPos = 0;
      } else {
        colorPos = colorPos || 0;
        colorPos += (100 - colorPos) / (l - i);
      }
    }

    if (~color.indexOf("###")) {
      color = parenColors[/###(\d+)###/.exec(color)[1]];
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

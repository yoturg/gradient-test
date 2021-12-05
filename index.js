function getLinearGradient(ctx, { value, x = 0, y = 0, width, height }) {
  console.log(arguments)
  let args
  let posParts = null
  const pos = []
  let start = 0
  let sX
  let sY
  let eX
  let eY
  const positions = ['top', 'bottom', 'left', 'right']
  let matchedColor
  let colorIndex
  const parenColors = []

  // 获得linear-gradient里面关于颜色的值
  args = /\((.*)\)/.exec(value)[1]
  matchedColor = /((hsl|hsla|rgb|rgba)\(.*?\))/.exec(args)
  while (matchedColor) {
    colorIndex = parenColors.push(matchedColor[1]) - 1
    args = `${args.substring(0, matchedColor.index)}###${colorIndex}###${args.substring(matchedColor.index + matchedColor[1].length, args.length)}`
    matchedColor = /((hsl|hsla|rgb|rgba)\(.*?\))/.exec(args)
  }
  args = args.split(',')

  // 获得表示方向
  posParts = args[0].trim().split(/\s+/)

  if (~posParts[0].indexOf('deg')) {
    // 如果第一个参数是方向
    pos.push(posParts[0])
  } else if (posParts[0] === 'to') {
    if (posParts.length === 2 && ~positions.indexOf(posParts[1])) {
      pos.push(posParts[1])
    } else if (posParts.length === 3 && ~posParts.indexOf('top') && ~posParts.indexOf('left')) {
      pos.push('315deg')
    } else if (posParts.length === 3 && ~posParts.indexOf('top') && ~posParts.indexOf('right')) {
      pos.push('45deg')
    } else if (posParts.length === 3 && ~posParts.indexOf('bottom') && ~posParts.indexOf('left')) {
      pos.push('225deg')
    } else if (posParts.length === 3 && ~posParts.indexOf('bottom') && ~posParts.indexOf('right')) {
      pos.push('135deg')
    } else {
      start = -1
    }
  } else {
    start = -1
  }

  if (start === -1) {
    return ctx.createLinearGradient()
  }

  // 没有设置方向时的默认值
  if (pos.length === 0) {
    pos.push('top')
  } else {
    start = 1
  }

  // 基于定位和宽高，获取起点终点的坐标
  console.log('posParts', posParts)
  console.log('args', args)
  console.log('pos', pos)
  if (pos.length === 1) {
    if (pos[0] === 'bottom') {
      sX = x + width / 2
      sY = y
      eX = x + width / 2
      eY = y + height
    } else if (pos[0] === 'left') {
      sX = x + width
      sY = y + height / 2
      eX = x
      eY = y + height / 2
    } else if (pos[0] === 'top') {
      sX = x + width / 2
      sY = y + height
      eX = x + width / 2
      eY = y
    } else if (pos[0] === 'right') {
      sX = x
      sY = y + height / 2
      eX = x + width
      eY = y + height / 2
    } else if (~pos[0].indexOf('deg')) {
      let alpha
      let cornerX
      let cornerY
      let cY
      const pi = Math.PI
      let centerX = x + width / 2
      let centerY = y + height / 2

      // 把角度改成弧度
      if (parseFloat(pos) < 0) {
        alpha = ((parseFloat(pos) + 360 * (parseInt(Math.abs(parseFloat(pos)) / 360, 10) + 1)) * pi) / 180
      } else {
        alpha = ((parseFloat(pos) % 360) * pi) / 180
      }
      const a = alpha
      // 往右上
      if (alpha >= 0 && alpha < pi / 2) {
        cornerX = x + width
        cornerY = y
      } else if (alpha >= pi / 2 && alpha < pi) {
        // 往左上
        cY = centerY
        centerY = centerX
        cornerY = x
        cornerX = cY
        centerX = y
      } else if (alpha >= pi && alpha < pi * 1.5) {
        // 往左下
        cY = centerY
        cornerX = centerX
        centerX = x
        centerY = y + height
        cornerY = cY
      } else if (alpha >= pi * 1.5 && alpha < pi * 2) {
        // 往右下
        cY = centerY
        centerY = x + width
        cornerY = centerX
        cornerX = y + height
        centerX = cY
      }

      console.log(`corner (${cornerX}, ${cornerY})`)
      console.log(`center (${centerX}, ${centerY})`)

      // 把角度转化为0～89，也就是0～.5pi
      alpha %= pi / 2

      // 对角和中心两个点为长边形成的三角形的tan值
      // const beta = Math.atan(Math.abs(centerY - cornerY) / Math.abs(cornerX - centerX))
      const beta = Math.atan2(Math.abs(centerY - cornerY), Math.abs(cornerX - centerX))
      console.log('beta', beta)
      console.log('beta-deg', rad2deg(beta))
      console.log('alpha', alpha)
      console.log('alpha-deg', rad2deg(alpha))

      // const omega = 

      // 对角到中心的长度
      const cornerDistance = Math.sqrt(Math.pow(centerY - cornerY, 2) + Math.pow(centerX - cornerX, 2))

      // 终点到中心的连线长度
      const endDistance = cornerDistance * Math.sin(beta + alpha)

      // 计算起点和终点
      // 右上
      if (a >= 0 && a < pi / 2) {
        eX = centerX + endDistance * Math.sin(alpha)
        eY = centerY - endDistance * Math.cos(alpha)
        sX = centerX * 2 - eX
        sY = centerY * 2 - eY
      } else if (a >= pi / 2 && a < pi) {
        // 左上
        eX = centerY - endDistance * Math.cos(pi / 2 - alpha)
        eY = cornerX - endDistance * Math.sin(pi / 2 - alpha)
        sX = centerY * 2 - eX
        sY = cornerX * 2 - eY
      } else if (a >= pi && a < pi * 1.5) {
        // 左下
        eX = cornerX + endDistance * Math.cos(pi - alpha)
        eY = cornerY + endDistance * Math.sin(pi - alpha)
        sX = cornerX * 2 - eX
        sY = cornerY * 2 - eY
      } else if (a >= pi * 1.5 && a < pi * 2) {
        // 右下
        eX = cornerY - endDistance * Math.cos(pi * 1.5 - alpha)
        eY = centerX - endDistance * Math.sin(pi * 1.5 - alpha)
        sX = cornerY * 2 - eX
        sY = centerX * 2 - eY
      }
    }

    // 起点和终点坐标
  }
  drawLing(ctx, { sX, sY, eX, eY })
  console.log(`sX=${sX}, sY=${sY}, eX=${eX}, eY=${eY}`)

  console.log('args', args)

  console.log('start', start)

  console.log('parenColor', parenColors)

  // 创建渐变对象
  const gradient = ctx.createLinearGradient(sX, sY, eX, eY)

  // 设置色标
  const colorStops = getColorStops(args.slice(start), parenColors, sX, sY, eX, eY)
  console.log('colorSrops', colorStops)
  // 在渐变对象上添加色标
  for (let s = 0; s < colorStops.length; s++) {
    gradient.addColorStop(colorStops[s].pos / 100, colorStops[s].color)
  }

  // 返回渐变对象
  return gradient
}

function getColorStops(stops, parenColors, sX, sY, eX, eY) {
  let i
  const l = stops.length
  let colorStop
  let stopParts
  let color
  let colorPos
  const colorStops = []

  for (i = 0; i < l; i++) {
    colorStop = stops[i].trim()

    if (colorPos >= 100) {
      break
    }

    if (~colorStop.indexOf(' ')) {
      stopParts = colorStop.split(' ')
      color = stopParts[0]
      colorPos = stopParts[1]

      if (~colorPos.indexOf('px')) {
        colorPos = (parseFloat(colorPos) / Math.sqrt(Math.pow(eX - sX, 2) + Math.pow(eY - sY, 2))) * 100
      } else {
        colorPos = parseFloat(colorPos)
      }
    } else {
      color = colorStop

      if (colorPos === undefined) {
        colorPos = 0
      } else {
        colorPos = colorPos || 0
        colorPos += (100 - colorPos) / (l - i)
      }
    }

    if (~color.indexOf('###')) {
      color = parenColors[/###(\d+)###/.exec(color)[1]]
    }

    colorStops.push({
      pos: colorPos,
      color,
    })
  }

  return colorStops
}

function deg2rad(deg) {
  return ((parseFloat(deg) % 360) * Math.PI) / 180
}

function rad2deg(rad) {
  return (rad * 180) / Math.PI
}

function drawLing(ctx, { sX, sY, eX, eY }) {
  ctx.strokeStyle = 'red'
  // 设置线条的宽度
  ctx.lineWidth = 2
  ctx.beginPath()
  // 起点
  ctx.moveTo(sX, sY)
  // 终点
  ctx.lineTo(eX, eY)
  ctx.closePath()
  ctx.stroke()
}

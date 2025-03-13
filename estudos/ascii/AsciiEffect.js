/**
 * Ascii generation is based on https://github.com/hassadee/jsascii/blob/master/jsascii.js
 *
 * 16 April 2012 - @blurspline
 */

class AsciiEffect {
  constructor(renderer, charSet = " .:-=+*#%@", options = {}) {
    // ' .,:;=|iI+hHOE#`$';
    // darker bolder character set from https://github.com/saw/Canvas-ASCII-Art/
    // ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'.split('');

    // Some ASCII settings

    const fResolution = options["resolution"] || 0.15; // Higher for more details
    const iScale = options["scale"] || 1;
    const bColor = options["color"] || false; // nice but slows down rendering!
    const bAlpha = options["alpha"] || false; // Transparency
    const bBlock = options["block"] || false; // blocked characters. like good O dos
    const bInvert = options["invert"] || false; // black is white, white is black
    const strResolution = options["strResolution"] || "low";
    const contraste = options["contraste"] || 0;
    const conCaracteresFijos = options["conCaracteresFijos"] || 0;
    const fuente = options["fuente"] || "courier new, monospace";

    let width, height;

    const domElement = document.createElement("div");
    domElement.style.cursor = "default";

    const oAscii = document.createElement("table");
    domElement.appendChild(oAscii);

    let iWidth, iHeight;
    let oImg;

    let palabras;
    let todosLosCaracteres = [];

    this.setSize = function (w, h) {
      width = w;
      height = h;

      renderer.setSize(w, h);

      initAsciiSize();
    };

    this.render = function (scene, camera) {
      renderer.render(scene, camera);
      asciifyImage(oAscii);
    };

    this.domElement = domElement;

    function compruebaNegro(r, g, b) {
      return r == 0 && g == 0 && b == 0;
    }

    // Throw in ascii library from https://github.com/hassadee/jsascii/blob/master/jsascii.js (MIT License)

    function initAsciiSize() {
      iWidth = Math.floor(width * fResolution);
      iHeight = Math.floor(height * fResolution);

      oCanvas.width = iWidth;
      oCanvas.height = iHeight;
      // oCanvas.style.display = "none";
      // oCanvas.style.width = iWidth;
      // oCanvas.style.height = iHeight;

      oImg = renderer.domElement;

      if (oImg.style.backgroundColor) {
        oAscii.rows[0].cells[0].style.backgroundColor =
          oImg.style.backgroundColor;
        oAscii.rows[0].cells[0].style.color = oImg.style.color;
      }

      oAscii.cellSpacing = 0;
      oAscii.cellPadding = 0;

      const oStyle = oAscii.style;
      oStyle.whiteSpace = "pre";
      oStyle.margin = "0px";
      oStyle.padding = "0px";
      oStyle.letterSpacing = fLetterSpacing + "px";
      oStyle.fontFamily = strFont;
      oStyle.fontSize = fFontSize + "px";
      oStyle.lineHeight = fLineHeight + "px";
      oStyle.textAlign = "left";
      oStyle.textDecoration = "none";

      let caracteresArray = charSet.split("");
      for (let y = 0; y < iHeight; y++) {
        todosLosCaracteres.push([]);
        for (let x = 0; x < iWidth; x++) {
          todosLosCaracteres[y].push(
            caracteresArray[Math.floor(Math.random() * caracteresArray.length)]
          );
        }
      }

      palabras = [
        [
          Math.floor(Math.random() * iWidth),
          Math.floor((Math.random() * iHeight) / 2),
          "aligacha",
        ],
        [
          Math.floor(Math.random() * iWidth),
          Math.floor((Math.random() * iHeight) / 2),
          "niallo",
        ],
        [
          Math.floor(Math.random() * iWidth),
          Math.floor((Math.random() * iHeight) / 2),
          "mostaceira",
        ],
      ];

      // Convertimos las palabras a mayúsculas
      palabras.map((palabra) => {
        palabra[2] = palabra[2].toUpperCase();
      });
    }

    const aDefaultCharList = " .,:;i1tfLCG08@".split("");
    const aDefaultColorCharList = " CGO08@".split("");
    const strFont = fuente;

    let nVueltasAnimacion = 0;
    let nSaltosAnimacion = 0;
    const vueltasInicioAnimacion = 20;
    const maxSaltosAnimacion = 100;

    const oCanvasImg = renderer.domElement;

    const oCanvas = document.createElement("canvas");
    if (!oCanvas.getContext) {
      return;
    }

    const oCtx = oCanvas.getContext("2d");
    if (!oCtx.getImageData) {
      return;
    }

    let aCharList = bColor ? aDefaultColorCharList : aDefaultCharList;

    if (charSet) aCharList = charSet;

    // Setup dom

    const fFontSize = (2 / fResolution) * iScale;
    const fLineHeight = (2 / fResolution) * iScale;

    // adjust letter-spacing for all combinations of scale and resolution to get it to fit the image width.

    let fLetterSpacing = 0;

    if (strResolution == "low") {
      switch (iScale) {
        case 1:
          fLetterSpacing = -1;
          break;
        case 2:
        case 3:
          fLetterSpacing = -2.1;
          break;
        case 4:
          fLetterSpacing = -3.1;
          break;
        case 5:
          fLetterSpacing = -4.15;
          break;
      }
    }

    if (strResolution == "medium") {
      switch (iScale) {
        case 1:
          fLetterSpacing = 0;
          break;
        case 2:
          fLetterSpacing = -1;
          break;
        case 3:
          fLetterSpacing = -1.04;
          break;
        case 4:
        case 5:
          fLetterSpacing = -2.1;
          break;
      }
    }

    if (strResolution == "high") {
      switch (iScale) {
        case 1:
        case 2:
          fLetterSpacing = 0;
          break;
        case 3:
        case 4:
        case 5:
          fLetterSpacing = -1;
          break;
      }
    }

    // can't get a span or div to flow like an img element, but a table works?

    // convert img element to ascii

    function asciifyImage(oAscii) {
      oCtx.clearRect(0, 0, iWidth, iHeight);
      oCtx.drawImage(oCanvasImg, 0, 0, iWidth, iHeight);
      const oImgData = oCtx.getImageData(0, 0, iWidth, iHeight).data;

      // Coloring loop starts now
      let strChars = "";

      // console.time('rendering');

      if (nSaltosAnimacion < 255) {
        // console.log("nVueltasAnimacion", nVueltasAnimacion);
        nVueltasAnimacion++;
      }

      if (nVueltasAnimacion > vueltasInicioAnimacion) {
        if (
          nVueltasAnimacion % 1 == 0 &&
          nSaltosAnimacion < maxSaltosAnimacion
        ) {
          nSaltosAnimacion += 10;
          //   console.log("nSaltosAnimacion", nSaltosAnimacion);
        }
      }

      let contrasteNormalizado = (contraste * 255) / 100; // scale integer percent to full range
      let factor =
        (255 + contrasteNormalizado) / (255.01 - contrasteNormalizado); //add .1 to avoid /0 error

      for (let y = 0; y < iHeight; y += 2) {
        for (let x = 0; x < iWidth; x++) {
          const iOffset = (y * iWidth + x) * 4;

          let iRed = oImgData[iOffset];
          let iGreen = oImgData[iOffset + 1];
          let iBlue = oImgData[iOffset + 2];
          let iAlpha = oImgData[iOffset + 3];
          let iCharIdx;

          let fBrightness;

          fBrightness = (0.3 * iRed + 0.59 * iGreen + 0.11 * iBlue) / 255;
          // fBrightness = (0.3*iRed + 0.5*iGreen + 0.3*iBlue) / 255;

          iCharIdx = Math.floor((1 - fBrightness) * (aCharList.length - 1));

          if (bInvert) {
            iCharIdx = aCharList.length - iCharIdx - 1;
          }

          // good for debugging
          //fBrightness = Math.floor(fBrightness * 10);
          //strThisChar = fBrightness;

          const esNegro = compruebaNegro(iRed, iGreen, iBlue);

          if (!esNegro) {
            iRed = factor * (iRed - 128) + 128;
            iGreen = factor * (iGreen - 128) + 128;
            iBlue = factor * (iBlue - 128) + 128;
          }

          let strThisChar;
          if (conCaracteresFijos) {
            strThisChar = todosLosCaracteres[y][x];
          } else {
            strThisChar = aCharList[iCharIdx];
          }

          if (strThisChar === undefined || strThisChar == " ")
            strThisChar = "&nbsp;";

          for (let i = 0; i < palabras.length; i++) {
            const palabra = palabras[i];
            if (
              (x >= palabra[0]) &
              (x < palabra[0] + palabra[2].length) &
              (y == palabra[1] || y + 1 == palabra[1])
            ) {
              strThisChar = palabra[2][x - palabra[0]];

              if (!esNegro) {
                if (nVueltasAnimacion > vueltasInicioAnimacion) {
                  iRed =
                    iRed +
                    ((255 - iRed) * nSaltosAnimacion) / maxSaltosAnimacion;
                  iGreen =
                    iGreen +
                    ((255 - iGreen) * nSaltosAnimacion) / maxSaltosAnimacion;
                  iBlue =
                    iBlue +
                    ((255 - iBlue) * nSaltosAnimacion) / maxSaltosAnimacion;
                }
              }
            }
          }

          if (bColor) {
            strChars +=
              "<span style='" +
              "color:rgb(" +
              iRed +
              "," +
              iGreen +
              "," +
              iBlue +
              ");" +
              (bBlock
                ? "background-color:rgb(" +
                  iRed +
                  "," +
                  iGreen +
                  "," +
                  iBlue +
                  ");"
                : "") +
              (bAlpha ? "opacity:" + iAlpha / 255 + ";" : "") +
              "'>" +
              strThisChar +
              "</span>";
          } else {
            strChars += strThisChar;
          }
        }

        strChars += "<br/>";
      }

      oAscii.innerHTML = `<tr><td style="display:block;width:${width}px;height:${height}px;overflow:hidden">${strChars}</td></tr>`;

      // console.timeEnd('rendering');

      // return oAscii;
    }
  }
}

export { AsciiEffect };

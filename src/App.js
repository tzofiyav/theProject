import React, { useRef, useEffect, useState } from "react";

const DirectionalBlurCanvas = () => {
  const rightCanvasRef = useRef(null);
  const leftCanvasRef = useRef(null);
  const combinedCanvasRef = useRef(null);

  const [leftEye, setLeftEye] = useState({ power: 0, cylinder: 0, axis: 0 });
  const [rightEye, setRightEye] = useState({ power: 0, cylinder: 0, axis: 0 });

  const maxPower = 6;
  const maxBlur = 8;

  const drawText = (ctx, text, width, height) => {
    ctx.clearRect(0, 0, width, height);
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText(text, width / 2, height / 2);
  };

  const applyBlur = (ctx, width, height, blurX, blurY) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = width;
    tempCanvas.height = height;

    tempCtx.putImageData(imageData, 0, 0);

    ctx.clearRect(0, 0, width, height);
    ctx.filter = `blur(${blurX}px) blur(${blurY}px)`;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = "none";
  };

  const calculateBlur = ({ power, cylinder, axis }) => {
    const baseBlur = Math.min((Math.abs(power) / Math.abs(maxPower)) * maxBlur, maxBlur);
    const cylinderBlur = Math.abs(cylinder) * 2;
    const rad = (axis * Math.PI) / 180;

    const blurX = baseBlur + Math.cos(rad) * cylinderBlur;
    const blurY = baseBlur + Math.sin(rad) * cylinderBlur;

    return { blurX: Math.abs(blurX), blurY: Math.abs(blurY) };
  };

  useEffect(() => {
    const drawBlurredCanvas = (canvas, eyeData, text) => {
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      drawText(ctx, text, width, height);
      const { blurX, blurY } = calculateBlur(eyeData);
      applyBlur(ctx, width, height, blurX, blurY);
    };

    drawBlurredCanvas(rightCanvasRef.current, rightEye, "בדיקת ראיה - עין ימין");
    drawBlurredCanvas(leftCanvasRef.current, leftEye, "בדיקת ראיה - עין שמאל");

    const combinedCtx = combinedCanvasRef.current.getContext("2d");
    const width = combinedCanvasRef.current.width;
    const height = combinedCanvasRef.current.height;
    drawText(combinedCtx, "בדיקת ראיה משולבת", width, height);

    const { blurX: blurXL, blurY: blurYL } = calculateBlur(leftEye);
    const { blurX: blurXR, blurY: blurYR } = calculateBlur(rightEye);
    const blurX = (blurXL + blurXR) / 2;
    const blurY = (blurYL + blurYR) / 2;
    applyBlur(combinedCtx, width, height, blurX, blurY);
  }, [leftEye, rightEye]);

  const handleChange = (eye, field, value) => {
    const newValue = parseFloat(value);
    if (eye === "left") setLeftEye((prev) => ({ ...prev, [field]: newValue }));
    else setRightEye((prev) => ({ ...prev, [field]: newValue }));
  };

  const renderControls = (eye, eyeLabel, eyeState) => (
    <div className="flex flex-col items-center gap-2" dir="rtl">
      <h3 className="font-bold">{eyeLabel}</h3>
      <label className="flex flex-col text-right w-64">
        מספר: {eyeState.power}
        <input
          type="range"
          min="-6"
          max="6"
          step="0.25"
          value={eyeState.power}
          onChange={(e) => handleChange(eye, "power", e.target.value)}
        />
      </label>
      <label className="flex flex-col text-right w-64">
        צילינדר: {eyeState.cylinder}
        <input
          type="range"
          min="0"
          max="6"
          step="0.25"
          value={eyeState.cylinder}
          onChange={(e) => handleChange(eye, "cylinder", e.target.value)}
        />
      </label>
      {eyeState.cylinder > 0 && (
        <label className="flex flex-col text-right w-64">
          ציר: {eyeState.axis}
          <input
            type="range"
            min="0"
            max="180"
            step="1"
            value={eyeState.axis}
            onChange={(e) => handleChange(eye, "axis", e.target.value)}
          />
        </label>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center">
        <canvas ref={rightCanvasRef} width={400} height={100} className="border rounded-xl shadow" />
        {renderControls("right", "עין ימין", rightEye)}
      </div>
      <div className="flex flex-col items-center">
        <canvas ref={leftCanvasRef} width={400} height={100} className="border rounded-xl shadow" />
        {renderControls("left", "עין שמאל", leftEye)}
      </div>
      <div className="flex flex-col items-center">
        <canvas ref={combinedCanvasRef} width={400} height={100} className="border rounded-xl shadow" />
        <p className="font-bold">שילוב בין שתי העיניים</p>
      </div>
    </div>
  );
};

export default DirectionalBlurCanvas;

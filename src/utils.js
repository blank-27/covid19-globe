import Globe from "./components/globe/globe";

let TWEEN = require("./components/globe/third-party/Tween");

export const createGlobe = (data, container, startTime) => {
  if (data.length === 0 || !container) return;

  let globe = new Globe(container);
  TWEEN.start();

  for (var i = 0; i < data.length; i++) {
    globe.addData(data[i][1], {
      format: "magnitude",
      name: data[i][0],
      animated: true,
    });
  }

  globe.createPoints();
  globe.animate();

  return globe;
};

export const updateGlobe = (globe, time, ease) => {
  if (ease) {
    new TWEEN.Tween(globe)
      .to({ time: time }, 400)
      .easing(TWEEN.Easing.Cubic.EaseOut)
      .start();
  } else {
    new TWEEN.Tween(globe).to({ time: time }, 0).start();
  }
};

export const parseData = (d) => {
  let arr = d.split("\n");
  let header = arr.shift().split(",");
  let len = header.length;
  let timelineLin = [];
  let timelineLog = [];

  let max = 0;
  arr.forEach((row) => {
    let rowArr = row.split(",");
    for (let i = 4; i < rowArr.length; i++) {
      max = Math.max(parseInt(rowArr[i]), max);
    }
  });
  let maxLog = Math.log(max / 5000);

  for (let i = 4; i < len; i++) {
    let dayLin = [];
    let dayLog = [];
    arr.forEach((row) => {
      let rowArr = row.split(",");
      dayLin.push(rowArr[2], rowArr[3], (1.5 * rowArr[i]) / max);
      dayLog.push(rowArr[2], rowArr[3], Math.log(rowArr[i] / 5000) / maxLog);
    });
    timelineLin.push([header[i] + "1", [...dayLin]]);
    timelineLog.push([header[i] + "2", [...dayLog]]);
  }

  return [timelineLin, timelineLog];
};

export const formatDate = (numDate) => {
  numDate = numDate.substring(0, numDate.length - 1);
  const date = new Date(numDate);
  const dateTimeFormat = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const [
    { value: month },
    ,
    { value: day },
    ,
    { value: year },
  ] = dateTimeFormat.formatToParts(date);

  return `${month.toUpperCase()} ${day}, ${year}`;
};

const getLabel = (month, year) => {
  let months = [
    "",
    `20${year.slice(0, 2)}`,
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return months[parseInt(month)];
};

export const getMarks = (data) => {
  let lastMonth = "1";
  let marks = [];
  let stepSize = 1;
  let currStep = 1;
  const numMonths = data.length / 30.5;

  if (numMonths > 24) {
    stepSize = 12;
  } else if (numMonths > 12) {
    stepSize = 4;
  } else if (numMonths > 9) {
    stepSize = 3;
  } else if (numMonths > 6) {
    stepSize = 2;
  }

  for (let i = 0; i < data.length; ++i) {
    const currDate = data[i][0].split("/");
    let currMonth = currDate[0];
    if (currMonth !== lastMonth) {
      lastMonth = currMonth;
      console.log(stepSize, currStep, numMonths);
      if (currStep === stepSize) {
        marks.push({
          value: i,
          label: getLabel(currMonth, currDate[2]),
        });
        currStep = 1;
      } else {
        marks.push({
          value: i,
          label: "",
        });
        currStep++;
      }
    }
  }

  return marks;
};

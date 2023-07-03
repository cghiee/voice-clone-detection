// Global variable to store the classifier
let classifier;

// Array to store the last 5 classification values
let classificationHistory = [];

// Label (start by showing listening)
let label = "listening";

// Progress bar variables
let progressBarX = 0;
let progressBarY = 0;
let progressBarHeight = 90;
let progressBarWidth = 8;
let progressBarDefaultColor = [200, 200, 200];
let progressBarPixels = [];

// Teachable Machine model URL:
let soundModelURL =
  "https://teachablemachine.withgoogle.com/models/oGM6Id9rB/model.json";

function setup() {
  createCanvas(windowWidth * 0.8, windowHeight * 0.8);
  background(0);

  // Load the model
  classifier = ml5.soundClassifier(soundModelURL, modelLoaded);
}

function modelLoaded() {
  // Start classifying
  // The sound model will continuously listen to the microphone
  classifier.classify(gotResult);
}

function draw() {
  // Set the background to black
  background(0);

  // Draw the progress bar background
  fill(progressBarDefaultColor);
  rect(0, height - progressBarHeight, width, progressBarHeight);

  // Draw the progress bar pixels
  for (let i = 0; i < progressBarPixels.length; i++) {
    let px = progressBarPixels[i].x;
    let py = progressBarPixels[i].y;
    let progressBarColor = progressBarPixels[i].color;
    fill(progressBarColor);
    rect(px, py, progressBarWidth, progressBarHeight);
  }

  // Draw the label in the canvas
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text(label, width / 2, height / 2);
}

// The model recognizing a sound will trigger this event
function gotResult(error, results) {
  if (error) {
    console.error(error);
    return;
  }

  // Store the latest classification value in the history array
  classificationHistory.push(results[0].label);

  // Check if the history array has reached 5 elements
  if (classificationHistory.length === 5) {
    // Count the occurrences of each class label in the history array
    let labelCounts = {};
    for (let i = 0; i < classificationHistory.length; i++) {
      let currentLabel = classificationHistory[i];
      if (labelCounts[currentLabel]) {
        labelCounts[currentLabel]++;
      } else {
        labelCounts[currentLabel] = 1;
      }
    }

    // Find the majority class label
    let majorityLabel = "";
    let maxCount = 0;
    for (let label in labelCounts) {
      if (labelCounts[label] > maxCount) {
        majorityLabel = label;
        maxCount = labelCounts[label];
      }
    }

    // Update the label with the majority class label
    if (majorityLabel === "background noise") {
      label = "Background Noise";
    } else {
      label = majorityLabel;
    }

    // Update the progress bar color based on the label
    let progressBarColor;
    if (label === "fake") {
      progressBarColor = [255, 0, 0]; // Red
    } else if (label === "real") {
      progressBarColor = [0, 240, 0]; // Green
    } else if (label === "Background Noise") {
      progressBarColor = [193, 236, 240]; // Light Blue
    }

    // Add the new set of pixels to the progress bar pixels array
    progressBarPixels.push({
      x: progressBarX,
      y: height - progressBarHeight,
      color: progressBarColor,
    });

    // Reset the classification history array
    classificationHistory = [];

    // Update the progress bar position for the new set of pixels
    progressBarX += progressBarWidth;

    // If the progress bar reaches the right edge of the canvas, wrap around to the left side
    if (progressBarX >= width) {
      progressBarX = 0;
    }

    // If the progress bar exceeds the canvas width, remove the oldest pixels
    if (progressBarPixels.length * progressBarWidth > width) {
      progressBarPixels.shift();
    }
  }
}

// Resize canvas when the window size changes
function windowResized() {
  resizeCanvas(windowWidth * 0.8, windowHeight * 0.8);
}

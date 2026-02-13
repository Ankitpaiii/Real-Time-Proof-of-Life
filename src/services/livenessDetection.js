/**
 * Liveness Detection Service
 * 
 * Wraps face-api.js to provide:
 * - Face presence detection
 * - Eye blink detection via Eye Aspect Ratio (EAR)
 * - Expression matching (smile, surprised/eyebrows)
 * - Head pose estimation from facial landmarks
 */

import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export async function loadModels() {
    if (modelsLoaded) return;

    const MODEL_URL = '/models';

    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);

    modelsLoaded = true;
    console.log('[LiveGuard] Face detection models loaded');
}

export function isModelsLoaded() {
    return modelsLoaded;
}

/**
 * Run a single detection frame on the video element.
 * Returns structured detection data.
 */
export async function detectFace(videoElement) {
    if (!modelsLoaded || !videoElement) return null;

    const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceExpressions();

    if (!detection) {
        return { faceDetected: false };
    }

    const landmarks = detection.landmarks;
    const expressions = detection.expressions;
    const positions = landmarks.positions;

    // === Blink Detection (Eye Aspect Ratio) ===
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const leftEAR = computeEAR(leftEye);
    const rightEAR = computeEAR(rightEye);
    const avgEAR = (leftEAR + rightEAR) / 2;
    const eyesClosed = avgEAR < 0.22;

    // === Expression Detection ===
    const smileScore = expressions.happy || 0;
    const surprisedScore = expressions.surprised || 0;
    const neutralScore = expressions.neutral || 0;
    const isSmiling = smileScore > 0.5;
    const isSurprised = surprisedScore > 0.4;

    // === Head Pose Estimation (simplified from landmarks) ===
    const nose = positions[30];
    const leftCheek = positions[0];
    const rightCheek = positions[16];
    const chin = positions[8];
    const forehead = positions[24];

    // Horizontal head turn: ratio of nose position between cheeks
    const faceWidth = rightCheek.x - leftCheek.x;
    const noseOffset = nose.x - leftCheek.x;
    const horizontalRatio = faceWidth > 0 ? noseOffset / faceWidth : 0.5;
    // 0.5 = centered, < 0.4 = turned right, > 0.6 = turned left
    const turnedLeft = horizontalRatio > 0.58;
    const turnedRight = horizontalRatio < 0.42;

    // Vertical nod: ratio of nose position in face height
    const faceHeight = chin.y - forehead.y;
    const noseVerticalOffset = nose.y - forehead.y;
    const verticalRatio = faceHeight > 0 ? noseVerticalOffset / faceHeight : 0.5;
    const isNodding = verticalRatio > 0.65 || verticalRatio < 0.35;

    return {
        faceDetected: true,
        detection,
        // Eyes
        eyesClosed,
        avgEAR,
        // Expressions
        isSmiling,
        smileScore,
        isSurprised,
        surprisedScore,
        neutralScore,
        expressions,
        // Head pose
        turnedLeft,
        turnedRight,
        isNodding,
        horizontalRatio,
        verticalRatio,
        // Raw data
        landmarks,
        positions
    };
}

/**
 * Match detection result to the required challenge type.
 */
export function matchChallenge(challengeType, detectionResult) {
    if (!detectionResult || !detectionResult.faceDetected) {
        return { matched: false, confidence: 0 };
    }

    switch (challengeType) {
        case 'blink':
            return {
                matched: detectionResult.eyesClosed,
                confidence: detectionResult.eyesClosed ? 0.9 : detectionResult.avgEAR < 0.25 ? 0.4 : 0.1
            };

        case 'smile':
            return {
                matched: detectionResult.isSmiling,
                confidence: detectionResult.smileScore
            };

        case 'turnLeft':
            return {
                matched: detectionResult.turnedLeft,
                confidence: detectionResult.turnedLeft ? 0.85 + (detectionResult.horizontalRatio - 0.58) : 0.1
            };

        case 'turnRight':
            return {
                matched: detectionResult.turnedRight,
                confidence: detectionResult.turnedRight ? 0.85 + (0.42 - detectionResult.horizontalRatio) : 0.1
            };

        case 'nod':
            return {
                matched: detectionResult.isNodding,
                confidence: detectionResult.isNodding ? 0.85 : 0.1
            };

        case 'raiseEyebrows':
            return {
                matched: detectionResult.isSurprised,
                confidence: detectionResult.surprisedScore
            };

        default:
            return { matched: false, confidence: 0 };
    }
}

/**
 * Compute Eye Aspect Ratio for blink detection.
 * Uses the 6 landmark points of each eye.
 */
function computeEAR(eyePoints) {
    // Vertical distances
    const v1 = distance(eyePoints[1], eyePoints[5]);
    const v2 = distance(eyePoints[2], eyePoints[4]);
    // Horizontal distance
    const h = distance(eyePoints[0], eyePoints[3]);

    if (h === 0) return 0;
    return (v1 + v2) / (2.0 * h);
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Draw face detection overlay on a canvas element.
 */
export function drawDetections(canvas, videoElement, detection) {
    if (!canvas || !detection || !detection.detection) return;

    const ctx = canvas.getContext('2d');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face landmarks
    const dims = faceapi.matchDimensions(canvas, videoElement, true);
    const resized = faceapi.resizeResults(detection.detection, dims);

    faceapi.draw.drawFaceLandmarks(canvas, resized);
}

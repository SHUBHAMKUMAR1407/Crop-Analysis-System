# Crop Analysis System

An AI-powered crop health analysis platform that combines pest detection and plant disease classification in a single application. Users can upload a plant image through the web interface and receive pest bounding boxes, pest severity, disease status, and visual overlays through a FastAPI inference service.

## Overview

Crop damage caused by pests and plant diseases is difficult to identify early through manual inspection alone. This project provides a unified computer-vision workflow for:

- Detecting and localizing pests with bounding boxes.
- Classifying plant diseases from leaf images.
- Returning severity indicators for both pest activity and disease presence.
- Displaying predictions and overlays in a browser-based interface.

## Key Features

- **Dual AI analysis:** pest detection and disease classification from one image.
- **Pest localization:** returns the number, class, confidence, and coordinates of detected pests.
- **Disease inference:** classifies supported plant-health categories using EfficientNet-B0.
- **Interactive frontend:** React and TypeScript interface with image upload and canvas visualization.
- **Safe image upload:** supports drag-and-drop and rejects non-image files or images larger than 5 MB before analysis.
- **REST API:** FastAPI endpoint for programmatic image analysis.
- **Training utilities:** scripts for model training, dataset preparation, and API/model verification.
- **Container support:** Dockerfiles are included for backend and frontend deployment workflows.

## System Architecture

```text
User uploads image
        |
        v
React + TypeScript frontend
        |
        |  POST /analyze
        v
FastAPI backend
        |
        +--> EfficientNet-B0  -> Disease classification
        |
        +--> YOLO detector     -> Pest detection and bounding boxes
        |
        v
Combined JSON response + visual overlays
```

## Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, HTML Canvas |
| Backend | Python, FastAPI, Uvicorn, Pydantic |
| Disease model | PyTorch, TorchVision, EfficientNet-B0 |
| Pest model | Ultralytics YOLO |
| Image processing | Pillow, NumPy, OpenCV |
| Deployment | Docker |

## Model Summary

### Pest Detection

The pest-analysis service uses an Ultralytics YOLO model to detect pest objects in an image. Each detection includes:

- Pest label and class ID.
- Confidence score.
- Bounding box in `[x, y, width, height]` format, where `x` and `y` represent the top-left corner.
- Overall severity based on the number of detected pests.

### Disease Classification

The disease-analysis service uses a custom EfficientNet-B0 classifier with 224 × 224 image preprocessing and ImageNet normalization. The deployed class list includes healthy and diseased categories for pepper, potato, and tomato leaves.

The classifier returns a disease severity label and a response-compatible mask field. The current implementation does not generate a pixel-level segmentation mask; the mask value is therefore empty unless a segmentation service is added.

## Project Structure

```text
Crop-Analysis-System/
├── backend/
│   ├── main.py                         # FastAPI application and /analyze endpoint
│   ├── schemas.py                      # Pydantic request/response schemas
│   ├── requirements.txt                # Python dependencies
│   ├── services/
│   │   ├── disease_service.py          # EfficientNet inference service
│   │   └── pest_service.py             # YOLO inference service
│   ├── train_disease_segmentation.py   # Disease-model training utility
│   ├── train_pest_yolo.py              # Pest-model training utility
│   ├── prepare_plant_dataset.py        # Dataset preparation utility
│   ├── verify_api.py                   # API verification script
│   └── verify_yolo11.py                # YOLO verification script
├── frontend/
│   ├── src/
│   │   ├── App.tsx                     # Main application screen
│   │   └── components/
│   │       ├── ImageUpload.tsx         # Image upload control
│   │       └── ResultsOverlay.tsx      # Canvas-based prediction overlay
│   ├── package.json                    # Frontend dependencies and scripts
│   └── vite.config.ts                 # Vite configuration
└── README.md
```

## Requirements

- Python 3.9 or later.
- Node.js 18 or later and npm.
- A YOLO pest model file.
- An EfficientNet disease-classification checkpoint.
- Optional: CUDA-compatible GPU for faster inference and training.

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd Crop-Analysis-System
```

### 2. Set up the backend

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Linux or macOS:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Add model checkpoints

Place the model files at the paths expected by `backend/main.py`:

```text
backend/
├── efficientnet_plant_best.pt
└── models/
    └── yolov8s_pest.pt
```

If the checkpoints are stored elsewhere, update `DISEASE_MODEL_PATH` and `PEST_MODEL_PATH` in `backend/main.py`.

### 4. Start the backend

From the `backend` directory:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

Interactive API documentation is available at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 5. Set up and start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

For a production build:

```bash
npm run build
npm run preview
```

## API Reference

### `GET /`

Returns a basic backend health response.

Example response:

```json
{
  "status": "ok",
  "message": "Crop Analysis Backend Running"
}
```

### `POST /analyze`

Accepts a plant image as multipart form data.

#### Request

```bash
curl -X POST "http://localhost:8000/analyze" \
  -F "file=@path/to/plant-image.jpg"
```

#### Response

```json
{
  "disease": {
    "diseased_area_percent": 100.0,
    "severity": "High (Tomato Early blight)",
    "mask_shape": [1024, 768],
    "mask_b64": ""
  },
  "pest": {
    "count": 2,
    "severity": "Low",
    "boxes": [
      {
        "box": [120.5, 84.2, 75.0, 61.0],
        "label": "pest",
        "confidence": 0.91,
        "class_id": 0
      }
    ]
  }
}
```

## Training Utilities

The repository includes scripts for model development:

```bash
python backend/prepare_plant_dataset.py
python backend/train_disease_segmentation.py
python backend/train_pest_yolo.py
python backend/verify_api.py
python backend/verify_yolo11.py
```

Training scripts may require additional dataset files and directory structures that are not included in this repository. Configure dataset paths and training parameters before running them.

## Frontend Commands

Run these commands from `frontend/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and create a production build |
| `npm run lint` | Run ESLint checks |
| `npm run preview` | Preview the production build locally |

## Model Evaluation

The project experiments documented in the training artifacts reported the following approximate results:

| Task | Model | Reported metric |
| --- | --- | --- |
| Pest detection | YOLO small variant | mAP@0.5: ~0.85 |
| Disease classification | EfficientNet-B0 | Accuracy: ~98% |

These values depend on the dataset split, checkpoint, preprocessing pipeline, and runtime environment. They should be revalidated before production use.

## Limitations and Production Considerations

- Model checkpoints are not included in the repository and must be supplied separately.
- The frontend currently calls `http://localhost:8000/analyze` directly; configure an environment-based API URL for deployment.
- CORS is currently permissive for local development and should be restricted in production.
- Disease area percentage is currently a placeholder for classification-only inference.
- Predictions are intended for research and decision support, not as a replacement for professional agricultural diagnosis.
- Production deployment should add authentication, file-size validation, structured logging, monitoring, and rate limiting.

## Roadmap

- Add environment-based frontend and backend configuration.
- Add true disease segmentation and pixel-level mask generation.
- Add confidence thresholds and user-configurable inference settings.
- Add automated tests and CI validation.
- Add persistent prediction history and downloadable reports.

## License

Add the project license and dataset attribution here before public distribution.

## Acknowledgements

This project builds on open-source tools and research in deep learning, image classification, and object detection, including PyTorch, TorchVision, Ultralytics, FastAPI, React, and Vite.

from .yolo_model import extract_keywords_yolo
from .resnet_model import extract_keywords_resnet
from .mobilenet_model import extract_keywords_mobilenet

model_registry = {
    "yolo": extract_keywords_yolo,
    "resnet": extract_keywords_resnet,
    "mobilenet": extract_keywords_mobilenet
}

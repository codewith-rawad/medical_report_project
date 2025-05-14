

from app.ml_models import model_registry

def run_selected_models(image_path, selected_models):
    keywords = []
    for model_name in selected_models:
        extractor = model_registry.get(model_name)
        if extractor:
            keywords += extractor(image_path)
    return list(set(keywords))

from flask import Blueprint, request, jsonify
import re

nlp_bp = Blueprint('nlp', __name__)

@nlp_bp.route('/parse_patient_info', methods=['POST'])
def parse_patient_info():
    data = request.get_json()

    if not data or 'transcript' not in data:
        return jsonify({'message': 'Transcript is required'}), 400

    transcript = data['transcript'].lower()

   
    name_match = re.search(r'name is ([a-z\s]+)', transcript)
    age_match = re.search(r'age is (\d{1,3})', transcript)
    case_match = re.search(r'case is (.+)', transcript)

    result = {
        'patient_name': name_match.group(1).strip() if name_match else '',
        'age': age_match.group(1).strip() if age_match else '',
        'clinical_case': case_match.group(1).strip() if case_match else '',
    }

    return jsonify(result), 200

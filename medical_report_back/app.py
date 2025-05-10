from flask import Flask

app = Flask(__name__)
from app import create_app

app = create_app()
@app.route('/')
def home():
    return 'Welcome to the Medical Report System!'


if __name__ == '__main__':
    print(app.url_map)

    app.run(debug=True)

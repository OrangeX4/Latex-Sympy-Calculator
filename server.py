from flask import Flask, request
import json
from latex2sympy2 import latex2latex, variances
app = Flask(__name__)


@app.route('/')
def main():
    return 'Latex Sympy Calculator Server'


@app.route('/latex', methods=['POST'])
def latex():
    try:
        return {
            'data': latex2latex(request.json['data']),
            'error': ''
        }
    except Exception as e:
        return {
            'data': '',
            'error': str(e)
        }


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=7395)

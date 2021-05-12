from flask import Flask, request
import json
import latex2sympy2
import sympy
from sympy import *
from sympy.abc import *
from latex2sympy2 import latex2latex, latex2sympy, var, variances, set_variances
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

@app.route('/variances', methods=['GET'])
def get_variances():
    result = {}
    for key in var:
        result[key] = str(var[key])
    return json.dumps(result)

@app.route('/reset', methods=['GET'])
def reset():
    set_variances({})
    global var
    var = latex2sympy2.var
    return {
        'success' : True  
    }


@app.route('/python', methods=['POST'])
def run_python():
    try:
        rv = eval(request.json['data'])
        return {
            'data': str(rv),
            'error': ''
        }
    except Exception as e:
        return {
            'data': '',
            'error': str(e)
        }



if __name__ == '__main__':
    app.run(host='127.0.0.1', port=7395)
    

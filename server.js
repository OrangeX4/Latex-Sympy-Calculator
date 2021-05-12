const { spawn } = require('child_process')
const http = require('http')

const py = spawn('python', ['server.py'])
const port = 7395

py.stdout.on('data', (data) => {
    // console.log(data.toString())
})

py.stderr.on('data', (data) => {
    // console.error(data.toString())
})

py.on('exit', (code) => {
    console.log(`Exit Code: ${code}`)
})

function send(data, path, port, onSuccess, onError) {
    const _data = JSON.stringify({ data: data })
    
    const options = {
        hostname: '127.0.0.1',
        port: port,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': _data.length
        }
    }
    
    const req = http.request(options, res => {
        res.on('data', data => {
            const result = JSON.parse(data)
            if (result.error) {
                onError(result.error)
            } else {
                onSuccess(result.data)
            }
        })
    })
    
    req.on('error', error => {
        console.error(error)
    })
    
    req.write(_data)
    req.end()
}

function sendLatex(latex) {
    send(latex, '/latex', port, (data) => console.log(latex + ' : ' + data + '\n'), (err) => console.log(err + '\n'))
}

sendLatex('\\frac{d}{dx}(x^2+x)')
sendLatex('\\frac{d}{dx}(x^2+x)+^2')
sendLatex('y+x')


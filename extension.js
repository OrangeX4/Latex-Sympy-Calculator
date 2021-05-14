// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed



/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const { spawn } = require('child_process')
    const http = require('http')

    const py = spawn('python', [context.asAbsolutePath("server.py")])
    const port = 7395


    py.on('error', (err) => {
        console.log(err)
        vscode.window.showErrorMessage('Running python failed... Please make sure you have install "python", "latex2sympy2" and "Flask"')
    })
    
    py.on('exit', (code) => {
        console.log(`Exit Code: ${code}`)
        vscode.window.showErrorMessage('Running python failed... Please make sure you have install "python", "latex2sympy2" and "Flask"')
    })

    /**
     * @param {string} data
     * @param {string} path
     * @param {function} onSuccess
     * @param {function} onError
     */
    function post(data, path, onSuccess, onError) {
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

        req.on('error', () => {
            vscode.window.showInformationMessage('Activating the server...\nPlease retry for a moment.')
        })

        req.write(_data)
        req.end()
    }

    /**
     * @param {string} path
     * @param {function} onSuccess
     */
    function get(path, onSuccess) {
        const options = {
            hostname: '127.0.0.1',
            port: port,
            path: path,
            method: 'GET'
        }

        const req = http.request(options, res => {
            res.on('data', data => {
                const result = JSON.parse(data)
                onSuccess(result)
            })
        })

        req.on('error', () => {
            vscode.window.showInformationMessage('Activating the server...\r\nPlease try it again.')
        })

        req.end()
    }

    /**
     * @param {string} latex
     * @param {function} onSuccess
     * @param {function} onError
     */
    function sendLatex(latex, onSuccess, onError) {
        post(latex, '/latex', onSuccess, onError)
    }


    context.subscriptions.push(
        vscode.commands.registerCommand('latex-sympy-calculator.equal', function () {
            let editor = vscode.window.activeTextEditor
            if (!editor) { return }
            let doc = editor.document
            let selection = editor.selection
            let text = doc.getText(selection)

            sendLatex(text, (data) => {
                let editor = vscode.window.activeTextEditor
                if (!editor) { return }
                editor.edit((edit) => {
                    edit.insert(selection.end, '=' + data)
                })  
            }, (err) => {
                vscode.window.showErrorMessage(err)
            })
        })
    )

    context.subscriptions.push(
        vscode.commands.registerCommand('latex-sympy-calculator.replace', function () {
            let editor = vscode.window.activeTextEditor
            if (!editor) { return }
            let doc = editor.document
            let selection = editor.selection
            let text = doc.getText(selection)

            sendLatex(text, (data) => {
                let editor = vscode.window.activeTextEditor
                if (!editor) { return }
                editor.edit((edit) => {
                    edit.replace(selection, data)
                })  
            }, (err) => {
                vscode.window.showErrorMessage(err)
            })
        })
    )

    context.subscriptions.push(
        vscode.commands.registerCommand('latex-sympy-calculator.define', function () {
            let editor = vscode.window.activeTextEditor
            if (!editor) { return }
            let doc = editor.document
            let selection = editor.selection
            let text = doc.getText(selection)

            sendLatex(text, () => {
                vscode.window.showInformationMessage('Define: ' + text)
            }, (err) => {
                vscode.window.showErrorMessage(err)
            })
        })
    )

    context.subscriptions.push(
        vscode.commands.registerCommand('latex-sympy-calculator.variances', function () {
            get('/variances', (data) => {
                let editor = vscode.window.activeTextEditor
                if (!editor) { return }
                editor.edit((edit) => {
                    const result = '\r\n' + Object.keys(data).map((key) => key + ' = ' + data[key]).join('\r\n')
                    edit.insert(editor.selection.end, result)
                })
            })
        })
    )

    context.subscriptions.push(
        vscode.commands.registerCommand('latex-sympy-calculator.reset', function () {
            get('/reset', () => { vscode.window.showInformationMessage('Success to reset the current variances') })
        })
    )

    context.subscriptions.push(
        vscode.commands.registerCommand('latex-sympy-calculator.toggle-complex-number', function () {
            get('/complex', (data) => { vscode.window.showInformationMessage('Toggle Complex Number to ' + (data.value ? 'Off' : 'On')) })
        })
    )

    context.subscriptions.push(
        vscode.commands.registerCommand('latex-sympy-calculator.python', function () {
            let editor = vscode.window.activeTextEditor
            if (!editor) { return }
            let doc = editor.document
            let selection = editor.selection
            let text = doc.getText(selection)

            post(text, '/python', (data) => {
                let editor = vscode.window.activeTextEditor
                if (!editor) { return }
                editor.edit((edit) => {
                    edit.insert(selection.end, ' = ' + data)
                })  
            }, (err) => {
                vscode.window.showErrorMessage(err)
            })
        })
    )
}

exports.activate = activate

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
    activate,
    deactivate
}

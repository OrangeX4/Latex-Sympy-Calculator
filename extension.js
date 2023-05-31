// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

const os = require('os')
const platform = os.platform()
let py

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const { exec, spawn } = require('child_process')
    const http = require('http')
    
    const port = 7395

    let python_path = ''

    switch (platform) {
        case 'darwin':
            python_path = vscode.workspace.getConfiguration('latex-sympy-calculator').get('macos')
            break;
        case 'linux':
            python_path = vscode.workspace.getConfiguration('latex-sympy-calculator').get('linux')
            break;
        case 'win32':
            python_path = vscode.workspace.getConfiguration('latex-sympy-calculator').get('windows')
            break;
        default:
            vscode.window.showErrorMessage('Unknown operate system.')
            return
    }

    // run auto update
    exec(python_path + ' -m pip install --upgrade latex2sympy2', (err, stdout, stderr) => {
        
        if (err) {
            console.log(err)
        }
        
        if (stderr) {
            console.log(stderr)
        }
        
        if (stdout) {
            console.log(stdout)
        }
    })
    
    // run server
    py = spawn(python_path, [context.asAbsolutePath("server.py")])

    py.on('error', (err) => {
        console.log(err)
        vscode.window.showErrorMessage('Running python failed... Please read the guide and make sure you have install "python", "latex2sympy2" and "Flask"')
    })
    
    py.on('exit', (code) => {
        console.log(`Exit Code: ${code}`)
        vscode.window.showErrorMessage('Running python failed... Please make sure you have "latex2sympy2 >= 1.8.0" and "Flask"')
        vscode.window.showErrorMessage('You can update it by "pip install --upgrade latex2sympy2" and reboot your computer')
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
    function sendMatrixRawEchelonForm(latex, onSuccess, onError) {
        post(latex, '/matrix-raw-echelon-form', onSuccess, onError)
    }
    function sendNumerical(latex, onSuccess, onError) {
        post(latex, '/numerical', onSuccess, onError)
    }
    function sendFactor(latex, onSuccess, onError) {
        post(latex, '/factor', onSuccess, onError)
    }
    function sendExpand(latex, onSuccess, onError) {
        post(latex, '/expand', onSuccess, onError)
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
                    edit.insert(selection.end, ' = ' + data)
                })  
            }, (err) => {
                vscode.window.showErrorMessage(err)
            })
        })
    )

    context.subscriptions.push(
        vscode.commands.registerCommand('latex-sympy-calculator.matrix-raw-echelon-form', function () {
            let editor = vscode.window.activeTextEditor
            if (!editor) { return }
            let doc = editor.document
            let selection = editor.selection
            let text = doc.getText(selection)

            sendMatrixRawEchelonForm(text, (data) => {
                let editor = vscode.window.activeTextEditor
                if (!editor) { return }
                editor.edit((edit) => {
                    edit.insert(selection.end, ' \\to ' + data)
                })  
            }, (err) => {
                vscode.window.showErrorMessage(err)
            })
        })
    )

    context.subscriptions.push(
        vscode.commands.registerCommand('latex-sympy-calculator.numerical', function () {
            let editor = vscode.window.activeTextEditor
            if (!editor) { return }
            let doc = editor.document
            let selection = editor.selection
            let text = doc.getText(selection)

            sendNumerical(text, (data) => {
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
        vscode.commands.registerCommand('latex-sympy-calculator.factor', function () {
            let editor = vscode.window.activeTextEditor
            if (!editor) { return }
            let doc = editor.document
            let selection = editor.selection
            let text = doc.getText(selection)

            sendFactor(text, (data) => {
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
        vscode.commands.registerCommand('latex-sympy-calculator.expand', function () {
            let editor = vscode.window.activeTextEditor
            if (!editor) { return }
            let doc = editor.document
            let selection = editor.selection
            let text = doc.getText(selection)

            sendExpand(text, (data) => {
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
function deactivate() {
  py.kill()
}

module.exports = {
    activate,
    deactivate
}

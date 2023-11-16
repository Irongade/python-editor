from pylint import epylint
import os
import tempfile
from flask import Flask, request
from flask_cors import CORS

# from pylint.lint import Run
# from pylint.reporters.text import TextReporter

app = Flask(__name__, static_folder='../build', static_url_path='/')
CORS(app)


@app.route('/')
# # @app.route('/<path:path>')
def index():
    # return render_template('index.html')
    # return app.send_static_file('index.html')
    return "Hello"


@app.route('/api/lint', methods=['POST'])
def lint_action():
    file = tempfile.NamedTemporaryFile(delete=False, mode='w', suffix=".py")
    file.write(request.form['code'])
    file.close()

    options = ' '.join([
        file.name,
        '--indent-string="  "',
        '--output-format', 'json',
        '--disable=C0111',
        '--disable=import-error',
        '--score=y'
    ])

    # print(options)

    (lint_stdout, lint_stderr) = epylint.py_run(
        return_std=True, command_options=options)

    # run_options = [
    #     file.name,
    #     '--indent-string="  "',
    #     '--output-format', 'json',
    #     '--disable=C0111',
    #     '--disable=import-error',
    #     '--score=y'
    # ]

    # pylint_output = StringIO()  # Custom open stream
    # reporter = TextReporter(pylint_output)
    # results = Run(run_options, reporter=reporter, exit=False)

    # print(results.linter.stats.global_note)
    # # print(results._output)
    # print(pylint_output.getvalue(), "heree")
    # print(file.name)

    os.remove(file.name)
    return lint_stdout.getvalue()


# @app.route('/<path:path>')
# def serve_paths():
#     return render_template('index.html')
#     # return app.send_static_file('index.html')
#     # return "Hello"


# @app.errorhandler(404)
# def handle_404(e):
#     if request.path.startswith("/api/"):
#         return jsonify(message="Resource not found"), 404
#     return send_from_directory(app.static_folder, "index.html")

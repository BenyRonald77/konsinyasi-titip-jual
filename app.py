"""Aplikasi Flask sistem konsinyasi / titip jual."""
from flask import Flask

from konsinyasi.api import api_bp
from konsinyasi.bagihasil import bh_bp
from konsinyasi.db import init_db
from konsinyasi.pages import pages_bp


def create_app() -> Flask:
    app = Flask(__name__)
    init_db()
    app.register_blueprint(api_bp)
    app.register_blueprint(bh_bp)
    app.register_blueprint(pages_bp)
    return app


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=5004, debug=False)
